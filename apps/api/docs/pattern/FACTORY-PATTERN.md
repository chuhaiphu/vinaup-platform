# Factory Pattern

## What

The **Factory pattern** moves object creation into a dedicated function — a *factory* — whose only job is to build and return the object, all construction logic lives in one place. The caller asks the factory for a ready-made instance instead of calling `new` itself.

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
Recipe     useClass · useValue ·      — HOW the container should build one
           useFactory · useExisting     given provider.
```

The Factory pattern shows up at the bottom layer: a provider declared with **`useFactory`** is called a **factory provider**. So, precisely:

- *"provider"* is a NestJS role.
- *"Factory"* is the design pattern.
- *"factory provider"* = the Factory pattern applied inside NestJS's DI system.

---

## The problem it solves

Without DI, a shared dependency becomes a hand-rolled global:

```ts
// naive: one global instance everyone imports
export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
```

It runs, but breaks on four fronts:

| Problem | Consequence |
| --- | --- |
| `process.env` read ad-hoc | a typo fails silently at the call site, not where config is defined |
| hand-imported global | cannot be swapped for a fake in tests |
| anyone can `new PrismaClient()` again | each `new` opens a separate connection pool → connections exhausted |

DI fixes the coupling and the sharing; the Factory pattern fixes the **construction** part — building an object whose inputs are only known at runtime.

---

## The four ways to register a provider

`useFactory` is one of four recipes. Picking the right one starts with knowing what each does:

| Recipe | What the container does | Use when |
| --- | --- | --- |
| `useClass` (shorthand `[FooService]`) | calls `new FooService(...)`, injecting its constructor params | it is **our** class and the container can construct it from injectable dependencies |
| `useValue` | injects a ready-made value as-is | a constant, a static config object, or a mock in tests |
| `useFactory` | runs a function and registers whatever it **returns** | the value cannot be produced by just newing a class (see below) |
| `useExisting` | makes a second token alias an existing one | giving one provider a second name |

Most services we write need only `useClass`/shorthand — the container can `new CarService(prismaService)` on its own.

---

## When we actually need a factory

> The value cannot be produced by the container simply newing a class from its injectable constructor parameters.

That happens in four situations:

1. **The value needs a runtime input** — e.g. a `connectionString` taken from config. We cannot write the value into the `providers` array ahead of time; it must wait until the container can supply the config.
2. **The object comes from a third-party library** (`PrismaPg`, `Stripe`, `Redis`, `S3Client`). The container does not know what arguments its constructor expects, so we must describe construction ourself.
3. **Construction needs logic** — branching on `NODE_ENV`, choosing options, or `await`-ing async setup before returning.
4. **We want to inject a non-class value** computed from other providers.

**Why this happens — who calls `new` decides everything.** The moment we write
`providers: [PrismaPg]` we are no longer the one calling `new` — we hand that job to the
**container**. That single fact is the root of the whole section:

| We write | Who runs `new`? | What can go in the constructor? |
| --- | --- | --- |
| `new PrismaPg({ ... })` by hand | **we** | anything we want — we pass the argument werself |
| `providers: [PrismaPg]` (shorthand `useClass`) | **the container** | **only** what the container can resolve **by token** |

We delegated `new` to the container, and the container does **not** pass arbitrary
values. It builds the class by reading **each** constructor parameter's *type* and looking that
type up as a registered **provider** (a class/value it knows, identified by a **token**). A parameter it has no token for, it cannot supply.

`MyPg` below is a deliberate **contrast** to `PrismaPg`: same role (an adapter), but written
*as our own injectable class whose constructor parameter is itself a provider* — which is exactly
what lets the container run `new` for us, no factory needed.

```ts
// @Injectable() → MyConfigService IS a provider (its token = the class itself).
@Injectable()
class MyConfigService {}

@Injectable()
class MyPg {
  constructor(private config: MyConfigService) {}   // parameter type = a registered provider → has a token
}

@Module({
  // Both MyConfigService and MyPg are providers.
  // To build MyPg the container reads its constructor parameter type (MyConfigService),
  // finds that same provider by token, and injects it. No factory needed.
  providers: [MyConfigService, MyPg],
})
class MyModule {}
```

`PrismaPg` breaks that rule on **both** counts, so `providers: [PrismaPg]` is impossible:

```ts
// Its constructor takes ONE argument: a plain options object — not a provider.
new PrismaPg({ connectionString: 'postgresql://user:pass@localhost:5432/mydb' });
```

- **Its constructor parameter is an object literal of raw values** (`{ connectionString: string }`),
  not a provider — the container has no token for "an object with a connectionString", so when it
  tries `new PrismaPg(???)` it has nothing to supply. This is the *deciding* difference from `MyPg`:
  `MyPg`'s parameter type **is** a provider (resolvable), `PrismaPg`'s is **not**. Note this reason
  stands **even if `PrismaPg` were `@Injectable()`** — adding the decorator would not invent a token
  for that object, so `providers: [PrismaPg]` would still fail here.
- `PrismaPg` is a **third-party class**: it is not from our codebase, hence does not have `@Injectable()`, so DI container cannot introspect or register it as a `useClass` provider in the first place.

**either one alone** already rules out `providers: [PrismaPg]`.

A factory bridges the gap — *we* write the `new` call, and the container injects only the part that
**is** a provider (the config):

```ts
{
  provide: 'DATABASE',
  useFactory: (conf: ConfigType<typeof databaseConfig>) =>
    new PrismaPg({ connectionString: conf.url }),  // raw value WE pass in
  inject: [databaseConfig.KEY],                    // the provider the container resolves
}
```

---

## import time vs instantiation time

This is the idea behind the phrase *"a factory (not a class)… unknown at import time."* It rests on one plain JavaScript rule:

> An **expression** runs the moment it is evaluated. A **function body** does not run when defined — only when the function is **called**.

```ts
const x = new PrismaPg({ ... });        // runs IMMEDIATELY (bare expression)
const f = () => new PrismaPg({ ... });  // defines a function; body NOT run yet
f();                                     // NOW the body runs
```

When Node imports `prisma.module.ts`, it must evaluate the object passed to `@Module({...})` — which means **every bare expression inside `providers` runs immediately**:

```ts
// useValue: a bare expression → `new` runs at IMPORT time
{ provide: 'DATABASE', useValue: new PrismaPg({ connectionString: ??? }) }
//   at this moment the injected config does not exist yet → no URL → broken

// useFactory: a function → defined now, body runs LATER, with config injected
{ provide: 'DATABASE',
  useFactory: (conf) => new PrismaPg({ connectionString: conf.url }),
  inject: [databaseConfig.KEY] }
```

What runs when, per recipe:

| Declaration | At import time | Object actually built |
| --- | --- | --- |
| `useValue: new X(...)` | the `new` runs (bare expression) | at import time |
| `useFactory: (c) => new X(...)` | only the function is defined | at instantiation time (container calls it) |
| `useClass: X` / `[X]` | only a class reference is recorded | at instantiation time (container news it) |

The app boots in two phases — this is why running "later" is safe:

```
Phase 1 — Load / import       (import time)
  Node executes each module file; @Module({...}) is evaluated.
  → every bare expression in `providers` runs here.
  → no DI container has resolved config yet.

        ▼  (all files loaded)

Phase 2 — Bootstrap / instantiate   (instantiation time)
  NestFactory builds the container and walks the dependency graph:
  → resolves config (databaseConfig.KEY)
  → CALLS each useFactory with the resolved config
  → news each useClass; creates PrismaService (singleton)
```

`useValue: new PrismaPg(...)` is wrong because it builds the object in Phase 1, before config exists. `useFactory` defers construction to Phase 2, where the container can inject config.

---

## In this codebase

We use the Factory pattern once — to build the Postgres connection behind every query. The value flows through four stages, from `.env` to an injectable `PrismaService`:

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
  url: process.env.DATABASE_URL!,   // populated by step ① — undefined without it
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

| | Reads `.env`? | `ConfigService` visibility | Calls |
| --- | --- | --- | --- |
| `forRoot` + `isGlobal: true`  | ✅ | app-wide | once |
| `forRoot` + `isGlobal: false` | ✅ | local (importing module must re-import) | once |
| `forFeature(xConfig)`         | ❌ (relies on `forRoot`) | local | any number |

`forRoot` is the *bootstrap* (reads `.env`); `forFeature` only *adds a config slice* that step ③ injects. No `forRoot` → `.env` never read → the namespace's values are `undefined`.

---

## Why

**A factory exists because the value is unknown when the `providers` array is evaluated.** The connection string arrives through injected config, available only in Phase 2. `useClass` cannot express "build me from this injected config"; `useFactory` + `inject` can.

**The configuration namespace gives one typed source of truth**, so the URL is injected through `databaseConfig.KEY` instead of `process.env.DATABASE_URL` scattered across the code.

**The third-party adapter is constructed in exactly one place** — the rest of the app depends on `PrismaService`, never on `PrismaPg` or `pg`.

**One factory ⇒ one connection pool.** Providers are singletons, so the adapter and `PrismaService` are built once. Re-declaring `PrismaService` in a feature module would open a second pool. → [Module Pattern](MODULE-PATTERN.md)

---

## How

1. **Bootstrap config once in `AppModule`** with `ConfigModule.forRoot({ isGlobal: true, load: [...] })` — the only step that reads `.env`.
2. **Define each config as a `registerAs` namespace** returning a typed object; expose its values only through the generated `.KEY` token.
3. **Make the namespace injectable where consumed** with `ConfigModule.forFeature(xConfig)` in that module's `imports`.
4. **Build runtime-configured or third-party dependencies with a factory provider** — `{ provide, useFactory, inject }`, keeping `inject` order aligned with the factory parameters. Reach for `useFactory` only when `useClass`/`useValue` cannot construct the value (runtime input, third-party object, async setup, or computed value).
5. **Wrap the constructed client in an `@Injectable()` service and export only that** — consumers depend on the service, never on the underlying adapter or driver.

---
