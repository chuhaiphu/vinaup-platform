# Module Pattern

## What

The Module pattern groups related code into a self-contained unit that declares its dependencies and its public interface explicitly. A module owns a piece of behavior, decides what to share, and keeps everything else to itself. It is assembled from cohesive, loosely-coupled units.

### In this codebase

**NestJS modules are singletons by default.** Each module is instantiated exactly once at bootstrap, regardless of how many other modules import it. Every importer receives the same instance — the same providers, the same state, the same underlying resources.

Because of this, a module does not need to appear directly in `AppModule` to be available to the application. It is loaded transitively as long as any already-loaded module imports it, and the singleton guarantee ensures every import path reaches the same instance.

---

**Each business domain is one module**, registered directly in `AppModule`. `AppModule` is the mandatory entry point: NestJS builds the application by traversing `imports` starting from `AppModule`.

Kind of modules that must appear directly in `AppModule.imports`:

| Reason                                                          | Example                                                |
| --------------------------------------------------------------- | ------------------------------------------------------ |
| NestJS must load it to mount its HTTP routes                    | all feature modules (`BookingModule`, `TourModule`, …) |
| `AppController`/`AppService` need one of its exported providers | — (currently none)                                     |

The following shows how these rules play out in practice:

```ts
// src/booking/booking.module.ts
@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
```

`BookingModule` appears in `AppModule.imports` because its routes must be mounted. Its own `imports` declare what it depends on — the container makes the exported providers of each imported module injectable within this module's scope:

```
BookingModule
  │
  ├─ providers: [BookingService]
  │   └─ BookingService is owned and instantiated in this module's scope
  │
  └─ imports: [PrismaModule, AuthModule]
      │
      ├─ PrismaModule      exports PrismaService               → injectable in BookingService
      └─ AuthModule        exports PassportModule, JwtModule   → usable by @UseGuards(JwtAuthGuard)
```

If `PrismaModule` is removed from `imports`, the container fails at startup before the first request arrives:

```
Nest can't resolve dependencies of the BookingService (?).
```

### Shared infrastructure modules

These modules are imported by most feature modules; each encapsulates a cross-cutting capability and **exports** the providers others depend on:

| Module             | Exports                          | Purpose                                                                                                       |
| ------------------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `PrismaModule`     | `PrismaService`                  | the single database gateway (constructs the `@prisma/adapter-pg` adapter via a `'DATABASE'` factory provider) |
| `AuthModule`       | `PassportModule`, `JwtModule`    | makes JWT authentication usable in any module                                                                 |
| `NotifierModule`   | `NotifierService`                | outbound notifications; the facade alone is exported, so contracts and drivers stay internal and no other module can name a transport → [Notifier Facade Pattern](NOTIFIER-FACADE-PATTERN.md) |
| `StorageModule`    | `StorageService`                 | the file-storage contract; the driver stays internal, so no other module can name a backend → [Storage Pattern](STORAGE-PATTERN.md) |

`PrismaModule` is intentionally absent from `AppModule` because `AppController`/`AppService` do not use the database; although `PrismaModule` is invisible to `AppModule`, it is visible to other modules because they imported it.

`PrismaModule` is loaded transitively — via `BookingModule → PrismaModule`, `TourModule → PrismaModule`, and so on — and since modules are singletons, every path in the graph reaches the same `PrismaService` instance.

Feature modules never re-declare `PrismaService` in their own `providers` array either — doing so would create an isolated second instance that opens its own connection pool on its first query, invisible to all other modules. → [what must go through DI](FACTORY-PATTERN.md#what-must-go-through-di-and-what-may-be-newed)

### Module layout

The on-disk shape of a module (flat for a single resource, `controllers/` + `services/` subfolders for
several) is a structural convention. → [Coding Convention §2.1](../CODING-CONVENTION.md)

---

## Why

**The module boundary fails at startup, not at runtime.** The container builds the complete dependency graph when the application boots, before the first request arrives. A provider missing from `imports` surfaces as a hard error immediately — not a `Cannot inject` exception discovered only when a specific code path executes in production.

**The singleton default ensures shared infrastructure has exactly one instance.** `PrismaService` creates one connection pool; `JwtModule` holds one key configuration. If each feature module declared its own `PrismaService` locally, each would open a separate pool — multiplying connections proportionally to the number of feature modules.

**Grouping by domain (not by technical type)** keeps a feature's moving parts together. A change to bookings touches `src/booking/`; no global `services/` or `controllers/` folder needs to be navigated.

---

## How

1. **Register every feature module in `AppModule.imports`** — it is the entry point NestJS traverses; a module not reachable from it does not exist in the application.
2. **Import into `AppModule` only when required** — feature modules to mount routes; a shared module only when `AppController`/`AppService` use it. Transitive loading handles everything else.
3. **Import the module that exports what you need** — `PrismaModule` for the database, `AuthModule` for JWT guards. Do not re-provide shared services locally.
4. **Choose the layout by resource count**. → [Coding Convention §2.1](../CODING-CONVENTION.md)
5. **Export only what other modules consume** — feature modules export nothing; their only public surface is HTTP.

---