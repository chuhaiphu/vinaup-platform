# Coding Convention

## How conventions are enforced

| Tier | Enforced by | Examples |
|------|-------------|----------|
| **Mechanical** | Prettier / ESLint — fails `npm run lint` | formatting, symbol casing, import order, file naming |
| **Architectural** | Code review (a human reading the diff) | layer/import direction, "thin controller", validator scope |

---

## 1. Naming

### 1.1 File naming

Every file is `kebab-case` with a **role suffix**. The file name matches its primary exported symbol — one primary concept per file.

| Role | Pattern |
|------|---------|
| NestJS building blocks | `<domain>.<role>.ts` — `.controller`, `.service`, `.module`, `.guard`, `.strategy`, `.filter`, `.decorator`, `.config`, `.constant`, `.exception` |
| Request DTO (Zod bridge) | `<action>.request.dto.ts` — `class <Action>Request extends createZodDto(schema)` |
| Response DTO | `<action>.response.dto.ts` — `interface <Action><Thing>Response` |
| Zod schema (shared pkg) | `<domain>.schema.ts` — `const <action>Schema` — in `@vinaup-platform/validation` |
| Inferred interface (shared pkg) | `<domain>.interface.ts` — `type <Action>RequestInterface` — in `@vinaup-platform/validation` |
| Pure helper | `<verb>-<topic>.ts` — grouped under `_common/utils/` |

> The four request/response artifacts (schema · interface · request DTO · response DTO) and exactly
> what each is for are specified in **[§6 Request & response data shapes](#6-request--response-data-shapes)** — that section is the single source of truth for their naming.

### 1.2 Symbol naming

| Kind | Style |
|------|-------|
| Class / Interface / Type / Enum | `PascalCase` |
| Variable / function / method / parameter | `camelCase` |
| **Decorator factory function** | `PascalCase` |
| Reusable constant (`as const` object or primitive) | `CONSTANT_CASE` |
| Its derived type (from an `as const` object) | `PascalCase` |

> **Decorator factories are `PascalCase`, not `camelCase`** — a function that returns a property/parameter/method
> decorator is named like the decorator it produces (mirroring NestJS's own `@Injectable`, `@Controller`, `@CurrentUser`).
> This is the case where an app function is `PascalCase`; the `naming-convention` rule allows it.

**Names carry their shape** (per the team naming rules):
- Booleans read as predicates: `isSender`, `canEdit`, `hasSigned`.
- Non-primitive collections get a type suffix when the plural is ambiguous: `userByIdMap` (Map), `inputDayNumberSet` (Set), `tagList` (Array).
- Primitives keep semantic names — no type suffix (`count`, `name`, `isActive`).

### 1.3 Enum constants

Enumerated string values are declared **once** as a frozen object, with the matching type *derived* from it so values and type can never drift. → [DRY](principle/DRY.md)

1. **Container** — `UPPER_SNAKE`, singular, no abbreviations: `BOOKING_STATUS` (never `_TYPES` / `ORG_*`).
2. **Keys** — an *enum-like* object (a closed member set) uses `UPPER_SNAKE` keys and the value equals the key (`DRAFT: 'DRAFT'`, multi-word `SENDER_SIGNED: 'SENDER_SIGNED'`); a *config/data* object uses `camelCase` keys. A value is intrinsic — never re-cased to fit a rule.
3. **Derived type** — `PascalCase`, singular: `BookingStatus`.

```ts
// packages/validation/src/constants/booking.constant.ts
export const BOOKING_STATUS = {
  DRAFT: 'DRAFT',
  SENDER_SIGNED: 'SENDER_SIGNED',
} as const;

export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];
```

An enum referenced by a **shared Zod schema must live in `@vinaup-platform/validation`** (`src/constants/`) — the package is imported by api/mobile and can't import them back, so a schema can only reference an enum defined inside it. The schema reads it with `z.enum(BOOKING_STATUS)`. Enums used only inside the API (never by a schema) stay in `src/_common/constants/<domain>.constant.ts`.

---

## 2. File & folder structure

Organise **by domain, not by technical type** — a feature's moving parts stay together. → [SoC](principle/SOC.md), [Module Pattern](pattern/MODULE-PATTERN.md)

### 2.1 Module layout

| Shape | When | Layout |
|-------|------|--------|
| **Single-resource** | one controller + one service | flat files in the domain folder (`booking/booking.controller.ts`, …) |
| **Multi-resource** | several sub-resources under one domain | `controllers/` + `services/` subfolders, one `*.module.ts` wiring them |

```
organization/
├── controllers/   organization · customer · member · role
├── services/      organization · customer · member · role
├── dtos/
└── organization.module.ts
```

Every domain has a `dtos/` folder holding its request/response shapes.

### 2.2 Infrastructure roots

The leading `_` sorts both folders to the top and signals "infrastructure, not a domain".

| Root | Concern | Contents |
|------|---------|----------|
| `src/_core/` | **Cross-cutting request machinery** the framework wires into the pipeline | `guards/` (+ `guards/strategies/` for Passport strategies) · `filters/` · `decorators/` · `configs/` (add `pipes/` only if a custom pipe beyond `ZodValidationPipe` is needed) |
| `src/_common/` | **Shared kernel** — pure, framework-light building blocks reused by every domain | `constants/` · `exceptions/` · `dtos/` · `interfaces/` · `utils/` |

Shared cross-domain DTOs live under `_common/dtos/param/` and `_common/dtos/response/` — not re-declared per domain.

### 2.3 Pure helpers

Recurring pure logic is extracted to `src/_common/utils/`.

| Subdirectory | Concern | Example |
|--------------|---------|---------|
| `generator/` | building a value/clause | `generate-date-overlap-clause.ts` |
| `generator/string-generator/` | string formatting | `generate-unique-code.ts` |

> Add a concern subfolder (e.g. `calculator/` for business calculations) **only when a helper of that
> concern actually exists** — do not pre-create empty buckets (KISS).

---

## 3. Imports & exports

### 3.1 Named exports
Named exports error at the import site when a symbol is renamed or removed; default exports do not. Use named exports for app code (NestJS classes are exported named anyway).

### 3.2 Import order
Imports are grouped and ordered: Node built-ins → external packages (`@nestjs/*`, `nestjs-zod`, `zod`, …) → internal (`src/_core`, `src/_common`) → relative (`./`, `../`), with a blank line between groups.

### 3.3 Import direction

Dependencies point **downward only**. → [SoC](principle/SOC.md)

| Layer | May import |
|-------|------------|
| `_common/interfaces`, `_common/constants` | other interfaces/constants only |
| `_common/utils` | interfaces, constants, utils |
| `_core` (guards/filters/decorators/configs) | `_common/*`, `prisma` |
| `<domain>/*.service.ts` | `_common/*`, `prisma`, its own dtos, **another domain's service** (only when that domain's module is imported) |
| `<domain>/*.controller.ts` | `_common/*`, `_core/*`, its own service + dtos |
| `<domain>/*.module.ts` | everything it wires together |

A controller importing `PrismaService` directly, or a service importing `HttpResponse`, is a **layering violation**.

---

## 4. Formatting

Formatting is **not** discussed in prose — it is owned entirely by Prettier (`.prettierrc`) so there is
nothing to argue about. Run `npm run format`. Current settings:

| Option | Value |
|--------|-------|
| `singleQuote` | `true` |
| `semi` | `true` |
| `trailingComma` | `all` |
| `printWidth` | `120` |
| `tabWidth` | `2` |

---

## 5. Language features

- `const` by default, `let` only when reassigned; never `var`.
- Avoid `any`; prefer `unknown` and narrow. `@typescript-eslint/recommendedTypeChecked` flags unsafe `any` use.
- `interface` for object shapes that may be extended/implemented; `type` for unions, intersections, and derived types (e.g. the `as const` derived type in §1.3).
- No suppression directives (`@ts-ignore` / `eslint-disable`) without an inline reason comment.

---

## 6. Request & response data shapes

A request shape is declared **once** as a Zod schema and projected into the forms each consumer needs (a
type can't validate at runtime; NestJS needs a class; the type checker needs a type); a response shape is
declared **once** as a Prisma query-args const and its type derived from it. Naming is **mandatory** — for
action `<action>` in domain `<domain>`:

| Artifact | File | Symbol | Used by |
|----------|------|--------|---------|
| Zod schema | `validation/zod-schemas/<domain>.schema.ts` | `<action>Schema` | api request DTO; mobile forms |
| Inferred interface | `validation/interfaces/<domain>.interface.ts` | `<Action>RequestInterface` | services (input type) |
| Request DTO (class) | `api/<domain>/dtos/<action>.request.dto.ts` | `<Action>Request` | controllers (`@Body()`/`@Query()`/`@Param()`) |
| Query args (const) | `api/<domain>/dtos/<action>.response.dto.ts` | `<action><Thing>QueryArgs` | service query (`select` / spread); type source below |
| Response DTO(s) | `api/<domain>/dtos/<action>.response.dto.ts` | `<Action><Thing>Response` | service return; controller `HttpResponse<T>` |

- **Only the schema is hand-written**; the interface (`z.infer`) and DTO (`createZodDto`) are zero-logic bridges.
- The `RequestInterface` suffix applies **only** to a schema's inferred twin; other interfaces (`HttpResponse`, `AuthenticatedRequest`, `JwtPayload`) follow §1.2 with no suffix.
- **A response type that mirrors a stored record is derived, not hand-written** (a payload computed server-side — a token pair, derived flags — is a hand-written `interface` in the same file, since nothing is queried). Declare the projection as `const <action><Thing>QueryArgs = { select: { … } } satisfies Prisma.<Model>DefaultArgs` (Prisma's [recommended form](https://www.prisma.io/docs/orm/prisma-client/type-safety/operating-against-partial-structures-of-model-types) — plain object + `satisfies`, **not** `Prisma.validator`), then `export type <Action><Thing>Response = Prisma.<Model>GetPayload<typeof <action><Thing>QueryArgs>`. The QueryArgs const is camelCase, the type PascalCase.
- **The service query must reuse the const** — pass `<action><Thing>QueryArgs.select` (or spread the whole const) into the Prisma call so the query and the response type can never drift.

Full worked example and rationale → [Validation Pattern](pattern/VALIDATION-PATTERN.md), [DTO Pattern](pattern/DTO-PATTERN.md).

### 6.1 Builder by source

Match the Zod builder to where the value comes from. Temporal values use the same ISO builder
regardless of source; numbers currently arrive **only in a JSON body**, already carrying their JSON type.

| Logical type | Zod | Inferred TS | Why |
|--------------|-----|-------------|-----|
| number (JSON body) | `z.int()` / `z.number()` | `number` | `JSON.parse` already produces a number; a string is *rejected*. |
| Instant | `z.iso.datetime()` | `string` | ISO date-time string; convert with `new Date(...)` only where a `Date` is needed. → [Instant](pattern/INSTANT-TIME-PATTERN.md) |
| Calendar date | `z.iso.date()` | `string` | Date-only `YYYY-MM-DD`; matches a `String` `YYYY-MM-DD` column. → [Calendar-Date](pattern/CALENDAR-DATE-PATTERN.md) |

> No endpoint takes a **number in the query/param** (no pagination, no numeric filter), so `z.int()`
> on a body value is the only numeric case. A query string is never a number at runtime — the day a
> numeric query param is added, pick the string-to-number conversion tool then, don't pre-empt it here.

Temporal values split by lens. An **instant** (viewer-relative) → `z.iso.datetime()`, store `@db.Timestamptz(3)`, compare only → [Instant Time Pattern](pattern/INSTANT-TIME-PATTERN.md). A **calendar date** (org-anchored or plain) → `z.iso.date()`, store as a `String` `YYYY-MM-DD`, server may derive & aggregate → [Calendar-Date Pattern](pattern/CALENDAR-DATE-PATTERN.md).

---

## 7. Validation conventions

Validation is schema-first: every request shape is a Zod schema in `@vinaup-platform/validation`,
enforced by the global `ZodValidationPipe`. → [Validation Pattern](pattern/VALIDATION-PATTERN.md)

### 7.1 Cross-cutting rules

- **Request schemas use `z.strictObject`** — reject unknown keys so a typo'd or injected field fails loudly. (Zod 4's top-level `z.strictObject` replaces the old `.strict()` method.)
- **Optional text that must not be blank** → `z.string().trim().min(1).optional()` (`.trim()` runs before `.min()`).
- **Gate by the column, not by "optional"** — `.optional()` accepts `undefined` only (optional **non-nullable** — rejects `null` with a 400 at the pipe, not a 500 at the DB); `.nullable()` accepts `null` only (required, clearable); `.nullish()` accepts both (optional + clearable). The builder must match the Prisma column (`T` vs `T?`); the inferred type follows automatically. → [Optionality & nullability](pattern/VALIDATION-PATTERN.md#optionality--nullability-gating-undefined-and-null)
- **Update schemas = `createSchema.partial()`** — `.partial()` wraps every field in `.optional()` (omitted key = "leave unchanged") **without touching nullability**, so a `.nullable()` field stays clearable (effectively `.nullish()`) and a non-nullable field still rejects `null`. Declare nullability once, on the create schema. Fields that exist only on the update schema get their builder by hand.
- **Clearing a nullable column on update** — the field is `.nullable()` on the create schema; the client sends explicit `null` to set the column to NULL. An omitted key means "leave unchanged".

### 7.2 Zod recipes

| Field kind | Required | Optional |
|------------|----------|----------|
| Text | `z.string().trim().min(1)` | `…​.optional()` |
| Email | `z.email()` | `…​.optional()` |
| Phone (VN) | `z.string().trim().regex(VN_PHONE_REGEX)` | `…​.optional()` |
| Enum | `z.enum(E)` | `…​.optional()` |
| Instant (ISO date-time) | `z.iso.datetime()` | `…​.optional()` |
| Calendar date (`YYYY-MM-DD`) | `z.iso.date()` | `….optional()` |
| Number (JSON body) | `z.int().min(0)` | `…​.optional()` |
| Array of strings | `z.array(z.string())` | `…​.optional()` |
| Array of objects | `z.array(childSchema)` | `…​.optional()` |
| FK id | `z.string().min(1)` — existence is checked in the service/guard, **not** here | `…​.optional()` |

> The **Optional** column is `.optional()` — optional **non-nullable** (rejects `null`). For an optional
> **nullable** (clearable) column use `.nullish()`; for a required-but-clearable column use `.nullable()`.
> → [Optionality & nullability](pattern/VALIDATION-PATTERN.md#optionality--nullability-gating-undefined-and-null)

### 7.3 Where does a validation rule go — schema or service?

One question decides it: **does the rule need to read the database?**

| The rule needs… | Put it in | Examples |
|-----------------|-----------|----------|
| data in the request (no DB) | the **Zod schema** | email format, required, enum, `min`/`max`; comparing two fields of the same request — `endDate ≥ startDate`, `password === confirmPassword` |
| a database lookup | the **service or a guard** | "this email is already taken", "you own this record", "the order is still editable", "this `categoryId` actually exists" |

**Why this line:** the schema is shared with mobile, so a rule in the schema also runs on the client — it can only use what's in the request. A rule that must look something up in the DB can't run on the client, so it lives server-side (service/guard). → [Guard Pattern](pattern/GUARD-PATTERN.md)

Two follow-ons:

- In the schema, prefer a **built-in** Zod check (`.email()`, `.min()`, `.max()`). Only reach for `.refine()` for a custom multi-field rule that has no built-in (e.g. `password === confirmPassword`).
- **Don't re-validate in the service** what the schema already guarantees — `z.strictObject` already rejects unknown fields.

---

## 8. Controllers & services

→ [KISS](principle/KISS.md), [SoC](principle/SOC.md)

- **Controller = delegate-then-wrap.** A handler reads request inputs, calls one service method, and returns the `HttpResponse<T>` envelope. **No** business `if`, **no** `try/catch`, **no** Prisma.
  ```ts
  @UseGuards(JwtAuthGuard)
  @Get('/organization/:organizationId')
  async findByOrganizationId(@Param('organizationId') organizationId: string, @Query() filter: BookingFilterRequest): Promise<HttpResponse<BookingWithMeta[]>> {
    const data = await this.bookingService.findBookingsByOrganizationId(organizationId, filter);
    return { statusCode: HttpStatus.OK, message: 'Bookings retrieved successfully', data };
  }
  ```
- **Service returns plain domain objects** — never `HttpResponse`, `Request`, or HTTP status codes. It owns business rules + Prisma queries.
- **Inject dependencies; never `new` a service or `PrismaService`.**
- **Read config through a typed `registerAs` namespace** (`@Inject(appConfig.KEY)`), never `process.env.X` inline. → [Factory Pattern](pattern/FACTORY-PATTERN.md)
- **Guard order on a protected mutation:** `@UseGuards(JwtAuthGuard, <AuthorizationGuard>)` — authentication first, then exactly one authorization guard (`OrganizationPermissionGuard` or `TourImplementationAccessGuard`). → [Guard Pattern](pattern/GUARD-PATTERN.md)

### 8.1 Response envelope
Every response is the shared envelope; never redefine it. The envelope and `BaseMeta` live in `_common/interfaces`; each domain declares its own `XxxWithMeta = XxxResponse & { meta: XxxMeta }` next to its response DTO. → [DTO Pattern](pattern/DTO-PATTERN.md)

```ts
// src/_common/interfaces/interface.ts
export interface HttpResponse<T> { message: string; statusCode: number; data?: T; }
export interface BaseMeta { canEdit: boolean; }
```

---

## 9. Error handling

Throw a meaningful exception; the global exception filters shape the response. **Never build an error response by hand** in a service or guard. → [Exception Filter Pattern](pattern/EXCEPTION-FILTER-PATTERN.md)

| Situation | Throw |
|-----------|-------|
| Invalid input / state | `BadRequestException` (400) |
| Authorization denied | `ForbiddenException` (403) |
| Authentication failed | `AccessTokenInvalidException` (401 — the access JWT expired/forged: clears `atk`, **keeps** the session so the client can refresh) / `RefreshTokenInvalidException` (401 — the session is dead: clears **both** cookies) — these two route through the cookie-clearing filter. A 401 that is NOT a token death (wrong credentials at sign-in) → `InvalidCredentialsException`, a plain 401 that clears nothing |
| Missing resource | `NotFoundException` (404) |

Resource and business exceptions **extend the built-in that carries their status** (`NotFoundException`, `ForbiddenException`, `BadRequestException`, `ConflictException`) and override only the body to `{ error, message, statusCode }`. The **auth** exceptions (`auth.exception.ts`) instead extend `HttpException` directly — never `UnauthorizedException` — so a 401 can't be pulled into the cookie-clearing filter by subclassing. The `message` is written in **English** (developer-facing, for logs) — the client never renders it; it localizes off the stable `error` code.

**Default to a custom code.** Any error on the app's *business surface* — anything a client may branch on for UI, i18n, retry, or redirect — must be a custom exception with a stable `error` code, not a bare built-in (whose `error` is just the HTTP reason phrase and is not trackable). Reach for a bare built-in **only** for transport/framework-level or transient cases where the HTTP status alone is enough (e.g. `NotImplementedException` for an unbuilt feature, `GoneException` for a removed route, `ServiceUnavailableException` for maintenance). When in doubt, add a code. → the full catalog and acceptable-bare examples live in [Error Code Reference](reference/ERROR-CODE-REFERENCE.md).

### 9.1 Preconditions: inline throw vs. `assert*` helper

A **precondition** is a business rule a method requires before it may proceed (the record exists, the car belongs to the organization, no duplicate). Check the condition first and `throw` immediately on violation (fail-fast), never nest the happy path inside an `if`. This keeps the method flat and its exit conditions explicit. → [KISS](principle/KISS.md)

```ts
// Guard clause — flat, reads top-to-bottom
if (!trip) throw new TripNotFoundException();
// ... happy path continues unindented
```

**Default to an inline guard clause.** Extract the check into a private `assert*` helper only when at least one holds:

| Extract to `assert*` when… | Why |
|---|---|
| the check does I/O (a Prisma query) or spans several lines | keeps the caller at business altitude, not query detail |
| the same check is used by more than one method | one definition, no duplication → [DRY](principle/DRY.md) |
| a name makes the caller read as intent | the name states the post-condition the caller can then assume |

A one-line, in-memory, single-use check (`if (!x) throw`) stays **inline** — extracting it only adds indirection to chase. → [KISS](principle/KISS.md)

**`assert*` helper form:** `private`, named `assert<Subject><Condition>()` (e.g. `assertCarInOrganization`), returns `void` / `Promise<void>`, and throws the specific exception on violation — it **never returns a boolean**. The verb `assert` means "returns silently or throws", so the caller needs no return check.

```ts
private async assertCarInOrganization(carId: string, organizationId: string): Promise<void> {
  const car = await this.prismaService.car.findFirst({ where: { id: carId, organizationId }, select: { id: true } });
  if (!car) throw new TripAssignmentCarNotFoundException();
}
```

**Find-or-throw variant:** when the caller *also needs to read the record* (not just its existence), the guard returns its object instead of `void`: `findXByIdOrThrow(id): Promise<X>`, throw the specific exception if absent, else return it. This is the most common guard shape for `update` / `delete` / `findById`. Keep it `find*` (it returns data), not `assert*` (which returns nothing). Only extract it when the finding shape (its `include` / `select`) is **the same** across callers.

```ts
private async findSignatureByIdOrThrow(id: string): Promise<Signature> {
  const signature = await this.prismaService.signature.findUnique({ where: { id } });
  if (!signature) throw new SignatureNotFoundException();
  return signature;
}
```

---

## 10. Comments & documentation

Per the team rules — comments answer **WHY**, not WHAT:
- Structure non-trivial logic (utils, algorithms) as numbered/section steps:
  ```ts
  // ─── Step N: <one-line goal> ─────
  // <Why this approach / what trade-off it avoids / what edge case it handles>
  const ... = ...;
  ```
- Do not narrate obvious code. Reserve comments for the reasoning a reader can't recover from the code.

---

## Enforcement map

| § | Convention | Enforced by |
|---|------------|-------------|
| 1.1 | File naming | `eslint-plugin-check-file` |
| 1.2 | Symbol casing | `@typescript-eslint/naming-convention` |
| 1.3 | `as const` enums (shared in `validation` pkg) | Review |
| 2 | Folder structure | Review |
| 3.1 | Named exports | ESLint |
| 3.2 | Import order | `eslint-plugin-import` (`import/order`) |
| 3.3 | Import direction | Review |
| 4 | Formatting | Prettier |
| 5 | Language features | `typescript-eslint` recommendedTypeChecked |
| 6–10 | Typing, validation, controller/service, errors, comments | Review |
