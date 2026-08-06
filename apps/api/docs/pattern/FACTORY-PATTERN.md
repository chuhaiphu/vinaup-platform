# Factory Pattern

## What

The **Factory pattern** moves object creation into a dedicated function — a _factory_ — whose only job is to build and return the object, all construction logic lives in one place. The caller asks the factory for a ready-made instance instead of calling `new` itself.

In NestJS this pattern has a specific name and shape. Before using it, three terms must be kept apart — they sit at different layers and are **not** alternatives to each other:

```
Engine     DI container               — NestJS's machine that creates objects
                                        and wires them together. We never
                                        call `new`; the container does.
   │
Role       Provider                   — NestJS's word for ANYTHING registered
                                        with the container so it can be
                                        injected.
   │
Recipe     useClass - useValue      — HOW the container should build one
           - useFactory              given provider.
```

Each recipe answers that "how" differently:

| Recipe                                | What the container does                                       | Use when                                                                            |
| ------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `useClass` (shorthand `[FooService]`) | calls `new FooService(...)`, injecting its constructor params | it is **our** class and the container can construct it from injectable dependencies |
| `useValue`                            | registers a ready-made value as-is                            | a constant, a static config object, or a mock in tests                              |
| `useFactory`                          | calls a function and registers whatever it **returns**        | neither of the above can produce the value                                          |

Most services need only `useClass` or its shorthand — the container can `new CarService(prismaService)` on its own.

The Factory pattern lives in the last row: a provider declared with **`useFactory`** is a **factory provider**. So, precisely:

- _"provider"_ is a NestJS role.
- _"Factory"_ is the design pattern.
- _"factory provider"_ = the Factory pattern applied inside NestJS's DI system.

---

## The problem it solves

Without DI, a shared dependency becomes a hand-rolled global:

```ts
// naive: one global instance everyone imports
export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
```

It runs, but breaks on three fronts:

| Problem                               | Consequence                                                                               | How to solve it                                                                    |
| ------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `process.env` read ad-hoc             | a typo fails silently at the call site, not where config is defined                       | one typed `registerAs` namespace: the URL is injected through `databaseConfig.KEY` |
| hand-imported global                  | cannot be swapped for a fake in tests                                                     | a token the container owns, so a test overrides it with `useValue`                 |
| anyone can `new PrismaClient()` again | every client opens its **own** connection pool on its first query → connections exhausted | one singleton provider ⇒ one pool → [Module Pattern](MODULE-PATTERN.md)            |

---

## Import time vs instantiation time

### The JavaScript and Node.js underneath

> An **expression** is evaluated where it sits. A **function body** is not evaluated when the function
> is defined — only when the function is **called**.

```ts
const adapter = new PrismaPg({ … });      // an expression        → the `new` runs HERE
const build = () => new PrismaPg({ … });  // a function definition → the `new` has NOT run
build();                                  // the call             → NOW the `new` runs
```

A module file is code that Node **executes** at runtime. The first time anything imports a file, Node
runs it top to bottom **exactly once**, then caches the result.

That pass is what the phrase **"import time"** points at. Its precise name is **module evaluation**.

| Moment                                  | Program                    | What it does                                                                                                                              |
| --------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Compile time**                        | `tsc`, run by `nest build` | rewrites `src/*.ts` → `dist/*.js`: strips types, `import` becomes `require()`, a decorator becomes a **function call** to run at runtime. |
| **Module evaluation** — _"import time"_ | `node`, first milliseconds | executes each `dist/*.js` once, resolving the `require()` graph                                                                           |
| **Instantiation time**                  | `node`, immediately after  | `NestFactory` builds the providers                                                                                                        |

```
t+112ms  process starts     — tsc finished long ago, dist/*.js already on disk
t+112ms  module evaluation  — Node executes prisma.module.js
t+121ms  module evaluation  — Node executes prisma.service.js
t+137ms  all files loaded   — the container does not exist yet
t+142ms  instantiation      — the factory body runs → new PrismaPg()
t+154ms  container ready
```

### In Nest.js `@Module`

`@Module({ … })` is one of those decorators-turned-function-calls, and its argument is an object
literal. To make the call, Node must evaluate that argument first — the whole object, `providers`
array included — during module evaluation. So every entry in `providers` meets the same question:
**an expression, or a function body?** The three recipes below register the same `'DATABASE'` token
and differ **only** in their answer:

```ts
@Module({
  providers: [
    // ─── useClass (shorthand) — a class REFERENCE ─────────────────────────
    // Reading the name `PrismaService` constructs nothing.
    // The container records the class and constructs it at instantiation time.
    PrismaService,

    // ─── useValue — an EXPRESSION, and the trap ───────────────────────────
    // `new PrismaPg(...)` is evaluated during module evaluation.
    // At that moment nothing has resolved `databaseConfig`, so there is no URL to pass.
    // The trap in this case !!!: the adapter is built and stays wrong for the whole life of the process.
    { provide: 'DATABASE', useValue: new PrismaPg({ connectionString: /* no config yet */ }) },

    // ─── useFactory — a FUNCTION BODY, and the fix ────────────────────────
    // The arrow function is only *defined* here, the `new` inside it has not run.
    // The container calls the body at instantiation time,
    // after resolving every token in `inject` and passing them as the parameters
    // so `conf.url` exists by the time the `new` runs.
    {
      provide: 'DATABASE',
      useFactory: (conf: ConfigType<typeof databaseConfig>) =>
        new PrismaPg({ connectionString: conf.url }),
      inject: [databaseConfig.KEY],
    },
  ],
})
```

### What the container does at instantiation time

```
ONE `node dist/src/main` PROCESS
══════════════════════════════════════════════════════════════════════════

  MODULE EVALUATION — "import time"
  ────────────────────────────────────────────────────────────────────────
    Node executes each dist/*.js once, so every @Module({ … }) call runs.
    Evaluating its object literal:
        useClass    →  records a class reference
        useFactory  →  defines a function, body untouched
        useValue    →  CONSTRUCTS the object right now
    The Nest.js container does not exist yet.

                            ▼   all files loaded

  INSTANTIATION TIME
  ────────────────────────────────────────────────────────────────────────
    The container builds providers on demand.
    Construction (Instantiation) is PULLED by whoever needs it.

      build PrismaService
        │
        │  its constructor names        →  @Inject('DATABASE')
        │
        ├─ 'DATABASE' has no instance yet
        │    │
        │    │  its `inject` list       →  databaseConfig.KEY
        │    │
        │    ├─ build databaseConfig    →  { url: process.env.DATABASE_URL }
        │    │
        │    └─ CALL the factory body   →  new PrismaPg({ connectionString })  ①
        │
        └─ every param resolved         →  new PrismaService(adapter)          ②

    ① must finish before ② — ② cannot begin without its argument.
```

Two consequences follow:

- **A provider nobody injects is never built** — its `useFactory` body never runs at all.
- **Each provider is built at most once** (providers are singletons), so the second consumer receives
  the very instance the first consumer caused to be built.

---

## When a factory is required

`useFactory` is never a first choice. It is what remains after the other two recipes both fail. Take the example, `PrismaPg`, whose constructor takes exactly one
parameter:

```ts
new PrismaPg({ connectionString: 'postgresql://user:pass@localhost:5432/mydb' });
//             ^ the parameter's declared type is { connectionString: string }
```

Now try each recipe on it:

| Recipe     | Written as                      | Why it cannot build `PrismaPg`                                                                                                                                                                                                                                              |
| ---------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useClass` | `providers: [PrismaPg]`         | the **container** has to produce that `{ connectionString }` object itself, and the only way it produces anything is by looking a parameter's declared type up among the classes registered in `providers`. `{ connectionString: string }` is not a class and is registered nowhere |
| `useValue` | `useValue: new PrismaPg({ … })` | **we** type the `{ connectionString }` object ourselves, but the expression runs during module evaluation, when `databaseConfig` has not been resolved yet                                                                                                                  |

|              | **the argument** — what goes inside `new PrismaPg(…)` | **the moment** — when that `new` runs                |
| ------------ | ----------------------------------------------------- | ---------------------------------------------------- |
| `useClass`   | ✗ the container has nothing to pass                   | ✓ instantiation time, config already resolved        |
| `useValue`   | ✓ we type it ourselves                                | ✗ module evaluation, config does not exist yet       |
| `useFactory` | ✓ we type it ourselves                                | ✓ the container calls the body at instantiation time |

### The token rule — whoever calls `new` decides what may go in the constructor

| We write                                       | Who runs `new`?   | What may go in the constructor            |
| ---------------------------------------------- | ----------------- | ----------------------------------------- |
| `new PrismaPg({ … })` by hand                  | **we**            | anything — we pass the argument ourselves |
| `providers: [PrismaPg]` (shorthand `useClass`) | **the container** | **only** what it can resolve **by token** |

Writing `providers: [X]` hands `new` to the container, and the container passes no arbitrary values.
It reads each constructor parameter's _type_ and looks that type up as a registered **provider** — a
class or value it knows, identified by a **token**. A parameter it has no token for, it cannot supply.

`MyPg` below is the deliberate contrast of `PrismaPg`, written as our own injectable class whose constructor parameter is itself a provider, no factory needed.

```ts
// @Injectable() → MyConfigService IS a provider (its token = the class itself).
@Injectable()
class MyConfigService {}

@Injectable()
class MyPg {
  constructor(private config: MyConfigService) {} // parameter type = a provider → has a token
}

@Module({
  // To build MyPg the container reads its constructor parameter type (MyConfigService),
  // finds that same provider by token, and injects it. No factory needed.
  providers: [MyConfigService, MyPg],
})
class MyModule {}
```

`PrismaPg` fails the token rule, so `providers: [PrismaPg]` is impossible:

- **It is third-party.** Not our code, so it carries no `@Injectable()` and the container cannot
  register it as a `useClass` provider in the first place.

- **Even if it can be registered as `useClass`, its parameter has no token.** `{ connectionString: string }` is a plain object type, and a token
  only exists for something registered in `providers`.


**The only solution here is a factory:**
```ts
{
  provide: 'DATABASE',
  useFactory: (conf: ConfigType<typeof databaseConfig>) =>
    // _we_ write the `new PrismaPg(...)` call, so producing `{ connectionString }` never becomes the container's job
    // and the function in `useFactory` body is called at instantiation time, so `conf.url` already holds a value when it runs.
    new PrismaPg({ connectionString: conf.url }),  // raw value WE pass in
  inject: [databaseConfig.KEY],                    // the provider the container resolves
}
```

---

## In this codebase

We use the Factory pattern in three places: the Postgres adapter below, plus the two bindings in
[`NotifierModule`](NOTIFIER-FACADE-PATTERN.md#question-1-at-boot--which-driver-does-each-contract-use)
that pick one driver per contract. The Postgres case shows the full shape — the value flows through
four stages, from `.env` to an injectable `PrismaService`:

```
.env  DATABASE_URL=postgresql://user:pass@host/db
  │ ① ConfigModule.forRoot()   reads .env → process.env        (once, at root)
  ▼
process.env.DATABASE_URL
  │ ② registerAs('database')   reads it back → typed config under token .KEY
  ▼
databaseConfig  { url }
  │ ③ useFactory               builds the driver adapter from that config
  ▼
PrismaPg adapter
  │ ④ @Inject('DATABASE') → super({ adapter })   wires Prisma to Postgres
  ▼
PrismaService   this.user.findMany(), this.car.create(), …
```

**① Bootstrap (once, at the root).** Only `forRoot` reads the `.env` file into `process.env`; everything downstream depends on it.

```ts
// src/app.module.ts
ConfigModule.forRoot({ isGlobal: true, load: [appConfig, authConfig] }),
```

**② Configuration namespace.** `registerAs` returns a factory whose result is registered under the token `databaseConfig.KEY` — one typed source of truth for the URL. → [Coding Convention §8](../CODING-CONVENTION.md)

```ts
// src/_core/configs/database.config.ts
export default registerAs('database', (): DatabaseConfig => ({
  url: process.env.DATABASE_URL!, // populated by step ① — undefined without it
}));
```

`forFeature` makes that namespace injectable inside `PrismaModule` (it does **not** read `.env`):

```ts
// src/prisma/prisma.module.ts
imports: [ConfigModule.forFeature(databaseConfig)],
```

**③ Factory provider.** The adapter needs the runtime URL, so it is built by a function, not newed in place. `inject` resolves `databaseConfig.KEY` and passes it in — in the same order as the factory parameters.

```ts
// src/prisma/prisma.module.ts
{
  provide: 'DATABASE',                                   // the token others inject
  useFactory: (databaseConf: ConfigType<typeof databaseConfig>) =>
    new PrismaPg({ connectionString: databaseConf.url }), // Prisma 7 driver adapter
  inject: [databaseConfig.KEY],
}
```

**④ Injectable service.** `PrismaService` extends `PrismaClient`, receives the `'DATABASE'` adapter, and hands it to the parent constructor. Only `PrismaService` is exported; the adapter stays internal.

```ts
// src/prisma/prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient {
  constructor(@Inject('DATABASE') databaseAdapter: InstanceType<typeof PrismaPg>) {
    super({ adapter: databaseAdapter });
  }
}
```

### `forRoot` vs `forFeature`

Two independent axes — complementary, not alternatives:

|                               | Reads `.env`?            | `ConfigService` visibility              | Calls      |
| ----------------------------- | ------------------------ | --------------------------------------- | ---------- |
| `forRoot` + `isGlobal: true`  | ✅                       | app-wide                                | once       |
| `forRoot` + `isGlobal: false` | ✅                       | local (importing module must re-import) | once       |
| `forFeature(xConfig)`         | ❌ (relies on `forRoot`) | local                                   | any number |

`forRoot` is the _bootstrap_ (reads `.env`); `forFeature` only _adds a config slice_ that step ③ injects. No `forRoot` → `.env` never read → the namespace's values are `undefined`.

---

## How

1. **Bootstrap config once in `AppModule`** with `ConfigModule.forRoot({ isGlobal: true, load: [...] })` — the only step that reads `.env`.
2. **Define each config as a `registerAs` namespace** returning a typed object; expose its values only through the generated `.KEY` token.
3. **Make the namespace injectable where consumed** with `ConfigModule.forFeature(xConfig)` in that module's `imports`.
4. **Reach for a factory provider only when the argument or the moment forces it** — `{ provide, useFactory, inject }`, keeping `inject` order aligned with the factory parameters. → [When a factory is required](#when-a-factory-is-required)
5. **Wrap the constructed client in an `@Injectable()` service and export only that** — consumers depend on the service, never on the underlying adapter or driver.

---
