# Validation Pattern

## What

Validation is verifying that incoming data satisfies a defined set of rules before any logic acts on it. The rules are declared once, attached to the data they govern, and enforced at the boundary — so all downstream code can assume the data is well-formed.

### In this codebase

Validation is **schema-first**. Every request shape is a **Zod schema** declared once in the shared `@vinaup-platform/validation` package. The api app enforces it with a global `ZodValidationPipe` (nestjs-zod); the mobile app reuses the _same_ schema object in its forms.

Validation has two layers, each owning exactly one kind of rule:

| Rule kind                                                        | Lives in                      | Needs the DB             |
| ---------------------------------------------------------------- | ----------------------------- | ------------------------ |
| Shape / format / required / enum / pure cross-field              | Zod schema (shared package)   | No — pure, runs anywhere |
| Existence / ownership / state-machine / DB-dependent cross-field | Service or guard (`apps/api`) | Yes — needs Prisma       |

> The snippets below use a placeholder `Entity` domain — they show the _shape_ of the pattern, not a real feature.

#### Schema vs interface — two faces of one definition

A **schema** and an **interface** come from the same declaration but do different jobs:

|                | Schema                                                                            | Interface                                          |
| -------------- | --------------------------------------------------------------------------------- | -------------------------------------------------- |
| What it is     | A Zod object describing the rules **and** the runtime shape                       | The TypeScript type **inferred** from that schema  |
| When it exists | At **runtime** — a real value with a `.parse()` method (the pipe calls it for us) | At **compile time only** — erased after the build  |
| Job            | **Checks** data at the boundary (parse / reject / convert)                        | **Annotates** variables, parameters, return shapes |
| Lives in       | `packages/validation/src/zod-schemas/`                                            | `packages/validation/src/interfaces/`              |

We write the schema once; the interface is _derived_ from it with `z.infer`.

```ts
// packages/validation/src/zod-schemas/entity.schema.ts  — the SCHEMA (runtime value)
import { z } from 'zod';

export const createEntitySchema = z.strictObject({
  name: z.string().trim().min(1),
  email: z.email(),
});

// packages/validation/src/interfaces/entity.interface.ts  — the INTERFACE (compile-time type)
import type { z } from 'zod';
import { createEntitySchema } from '../zod-schemas/entity.schema';

export type CreateEntityRequestInterface = z.infer<typeof createEntitySchema>;
// ≡ { name: string; email: string }
```

`createEntitySchema` runs at the boundary and rejects a bad request; `CreateEntityRequestInterface` is what every function downstream uses to type that body. Change a field in the schema and the interface updates by itself. (Naming: schema `<action>Schema`, its inferred twin `<Action>RequestInterface` — [Coding Convention §6](../CODING-CONVENTION.md#6-request--response-data-shapes).)

#### Vietnamese messages: locale + per-field overrides

Validation messages are user-facing on mobile, so they are Vietnamese — and because the schema is the single source of both rule and message, the api returns the same Vietnamese message the mobile form shows. Two mechanisms, both living in the shared package:

1. **Global locale** — the package barrel installs Zod's Vietnamese locale once; every schema produces Vietnamese _default_ messages:

```ts
// packages/validation/src/index.ts
import { z } from 'zod';

z.config(z.locales.vi()); // Zod v4 locale — Vietnamese default messages for every rule

export { createEntitySchema } from './zod-schemas/entity.schema';
// … other exports
```

Importing anything from `@vinaup-platform/validation` runs this line, so both the api process and the mobile bundle get the locale for free — no per-app setup.

2. **Per-field override** — where the generic locale text is not good enough, the rule carries its own message via the Zod v4 `{ error }` option:

```ts
export const createEntitySchema = z.strictObject({
  name: z.string().trim().min(1, { error: 'Vui lòng nhập tên' }),
  email: z.email({ error: 'Email không hợp lệ' }),
});
```

The override wins over the locale; the locale wins over nothing. Write an override when the field deserves task-specific wording; otherwise let the locale speak.

#### Strip vs strict unknown fields

`z.object` **strips** unknown keys by default; `z.strictObject` **rejects** them. (In Zod 4 these top-level builders replace the old `.strip()` / `.strict()` methods.)

| Builder                       | Request carries an extra `role` field                             |
| ----------------------------- | ----------------------------------------------------------------- |
| `z.object` (default — strips) | `role` dropped silently → arrives `undefined` downstream          |
| `z.strictObject` (rejects)    | request rejected: **400** `Unrecognized key(s) in object: 'role'` |

**Convention: request schemas use `z.strictObject`** so a typo'd or injected field fails loudly instead of vanishing.

#### Where validation sits in the request lifecycle

The pipe runs **after** the guards (see [GUARD-PATTERN.md](GUARD-PATTERN.md)) and immediately before the **handler** (the controller method bound to the route). The request is authenticated/authorized first, _then_ its body is parsed:

```
Incoming request
  │
  ▼
Middleware        — raw req/res, no handler context yet      (Express-level)
  │
  ▼
Guards            — authenticate, then authorize             (see GUARD-PATTERN.md)
  │
  ▼
Interceptors      — wrap the call (before half)
  │
  ▼
Pipes             — validate / transform the handler args    ◄── ZodValidationPipe
  │                  schema.parse() → convert & strip, or 400 on failure
  ▼
Route handler     — the controller method (+ its services)
  │
  ▼
Interceptors      — wrap the call (after half), reversed
  │
  ▼
Exception filters — only if something threw; map error → HTTP response
  │
  ▼
Response
```

#### Zod validation pipe

A **route** is the `method + path` pair (`POST /entities`); its **handler** is the controller method bound to it (`create`). Take a controller with two endpoints:

```ts
@Controller('entities') // base path: /entities
export class EntityController {
  @Post() // route:  POST /entities
  create(@Body() body: CreateEntityRequest) {
    // handler bound to that route
    return this.entityService.create(body);
  }
}
```

When a `POST /entities` request arrives, it flows through two stages before the handler runs:

```
POST /entities   body = { name, email }
   │
   ▼
Nest router
   • match route    POST /entities → create()
   • read @Body()   class = CreateEntityRequest
   │
   │  hands (raw body + DTO class) to the global pipe
   ▼
ZodValidationPipe
   • read the schema stored on the DTO class
   • run  schema.parse(raw body)
   │
   ▼
parse() result
   ├─ valid   → parsed value → create(parsedBody)
   └─ invalid → throw ZodError → 400 Bad Request → create() never runs
```

Reading the diagram:

1. **Nest router** matches the route, then reads the _class_ annotating `@Body()` — `CreateEntityRequest`. It reads the class, not the type: a `z.infer` type alias is erased at build time, so the validation rules must travel on something that survives at runtime — the class.
2. **ZodValidationPipe** reads the Zod schema that `createZodDto` stored on the class and runs `schema.parse(raw body)`.
3. **On valid** the pipe returns the parsed value and Nest calls `create(parsedBody)` with it, never the raw body.
4. **On invalid** the pipe throws a `ZodError` → **400** → `create` never runs.

The same flow applies to `@Query()` and `@Param()` whenever they are typed with a `createZodDto` class.

#### The global pipe

A **pipe** in NestJS is a class that sits between the moment a request is **matched to a route** and the moment its **handler runs**. It receives the incoming value (a body, a query, a param) and may **transform** it (convert, strip) or **reject** it (throw → the handler never runs). Validation is exactly this job, so it lives in a pipe.

```ts
// apps/api/src/main.ts
import { ZodValidationPipe } from 'nestjs-zod';

app.useGlobalPipes(new ZodValidationPipe());
```

`useGlobalPipes` registers the pipe **once, for every route in the app**. We never attach a validator per-handler; every endpoint is validated the same way, through the same code, with the same error shape.

#### Bridging a schema into a Nest DTO

The schema is plain zod in the shared package; the API wraps it with `createZodDto` so Nest keeps its metadata, while the rules still come from the shared schema:

```ts
// apps/api/src/entity/dtos/create-entity.request.dto.ts
import { createZodDto } from 'nestjs-zod';
import { createEntitySchema } from '@vinaup-platform/validation';

export class CreateEntityRequest extends createZodDto(createEntitySchema) {}
```

```ts
@Post()
create(@Body() body: CreateEntityRequest) {
  // body is already parsed; the service types its input with CreateEntityRequestInterface
}
```

---

## Optionality & nullability: gating `undefined` and `null`

A request field can arrive in **three distinct states**, and they are not interchangeable:

| Client sends     | Runtime value | Intended meaning                              |
| ---------------- | ------------- | --------------------------------------------- |
| key omitted      | `undefined`   | "leave this field unchanged" (partial update) |
| `"field": null`  | `null`        | "clear this field → set the column to NULL"   |
| `"field": value` | `value`       | "set this field to this value"                |

### 1. Two declarations, enforced at two different times

A field's shape is governed by **two** declarations: the **Prisma column** (can the DB store NULL?) and the **Zod rule** (what the client may send). The TypeScript type is _not_ a third — it is `z.infer` of the rule, derived automatically and used only to type the input in the **service**:

```
 Prisma column      Zod rule (@ pipe, runtime)        Inferred type (tsc)         Service → Prisma
 (DB truth)         validates the client payload      z.infer of the rule         (persist)
 ──────────         ──────────────────────────        ───────────────────         ──────────────
   T | T?     ─►    none / .optional() /        ─►    derived, never        ─►     undefined → do nothing
                    .nullable() / .nullish()          hand-written;                null      → set NULL
                                                       types the service           value     → set value
```

The rule decides what the client may send; the type is inferred from it

```ts
// packages/validation/src/zod-schemas/entity.schema.ts
export const createEntitySchema = z.strictObject({
  name: z.string().trim().min(1), // required, non-nullable — both null and omit are rejected
  bio: z.string().nullable(), // required, but an explicit null clears the column
  avatar: z.string().optional(), // may be omitted; an explicit null is rejected
});

// The type is z.infer of the schema — derived, never hand-written, so it
// can never drift from the rules above:
type CreateEntity = z.infer<typeof createEntitySchema>;
// { name: string; bio: string | null; avatar?: string }

// Only the service uses this type — to type the input it receives:
function createEntity(input: CreateEntity) {
  /* … */
}
```

### 2. The four builders

A value-rule (`z.string()`, `z.email()`, `z.int()`, …) runs on **whatever arrives**, so a bare field is **required and non-nullable** — both `undefined` and `null` are rejected (400). To let one of them through, wrap the rule:

| Builder       | a value           | `undefined` / missing key     | `null`                 |
| ------------- | ----------------- | ----------------------------- | ---------------------- |
| _(none)_      | will be validated | ❌ reject 400                 | ❌ reject 400          |
| `.optional()` | will be validated | ⏭️ survives → leave unchanged | ❌ reject 400          |
| `.nullable()` | will be validated | ❌ reject 400                 | ✅ survives → set NULL |
| `.nullish()`  | will be validated | ⏭️ survives → leave unchanged | ✅ survives → set NULL |

"Survives" means the value reaches the service **unchanged** — the pipe never rewrites it: a `null` then sets the column to NULL, a missing key means "leave unchanged".

> `.optional()` widens the type to `T | undefined` **only**, so an explicit `null` sent to an optional **non-nullable** field is rejected at the pipe — a clean **400**, not a `null` slipping through to a `NOT NULL` column and dying as a **500**.

### 3. Match the builder to the column

The rule and the inferred type are one declaration, so the only thing that can fall out of sync is **the rule vs the Prisma column**:

```ts
// ✅ both agree — null clears the column
bio: z.string().nullable(),   // Prisma: bio String?

// ❌ rule accepts null, but the column can't store it → null reaches the DB → 500
bio: z.string().nullable(),   // Prisma: bio String   (NOT NULL)

// ❌ column is nullable, but the rule rejects null → client can never clear it → 400
bio: z.string(),              // Prisma: bio String?
```

Each builder maps to exactly one (presence × nullability) combo:

| Builder       | Inferred type       | Prisma column  | Reads as               |
| ------------- | ------------------- | -------------- | ---------------------- |
| _(none)_      | `field: T`          | `T` (NOT NULL) | required, non-nullable |
| `.optional()` | `field?: T`         | `T` (NOT NULL) | optional, non-nullable |
| `.nullable()` | `field: T \| null`  | `T?`           | required, nullable     |
| `.nullish()`  | `field?: T \| null` | `T?`           | optional, nullable     |

- **required** = key must be present (omit → 400) · **optional** = key may be omitted (omit → leave unchanged)
- **nullable** = `null` accepted → sets column to NULL · **non-nullable** = `null` rejected → 400

### 4. Update schemas: `.partial()` adds the "leave unchanged" gate

`.partial()` wraps **every** field in `.optional()` (omit → "leave unchanged") **without touching nullability** — so nullability stays declared once, on the create schema (→ [DTO Pattern](DTO-PATTERN.md)):

```ts
export const updateEntitySchema = createEntitySchema.partial();
// name   → .optional()             : omit = leave unchanged; null still rejected
// bio    → .nullable() + optional  : omit = leave unchanged; null still clears it (≡ .nullish())
// avatar → .optional()             : already optional non-nullable; unchanged
```

If the update has a field the create schema doesn't, attach it with `.extend()` and pick its builder by hand:

```ts
export const updateEntitySchema = createEntitySchema.partial().extend({
  status: z.enum(ENTITY_STATUS).optional(), // update-only field; NOT NULL column → .optional()
  // a nullable column would be → .nullish()
});
```

---

## Custom validation: `.refine()`

A Zod schema holds a **list of checks**. `.refine()` is simply a way to write **our own** check logic and add it to that same list when built-in checks don't cover the rule.

### 1. Mechanism — a schema checks as a list, in order

```ts
const schema = z.object({
  name: z.string().min(3),
});

schema.parse({ name: 'ab' });
```

1. **Declare** — `z.string().min(3)` builds schema made of two parts: a **type rule** ("must be a string" - `z.string()`) and a **check list** (`[ .min(3) ]` — extra rules chained after it).
2. **Parse** — `schema.parse({ name: 'ab' })` executes, for field `name` = `'ab'`:
   - run the type rule → `'ab'` is a string → pass → continue
   - run the check list, in order → `check[0] = .min(3)` → fail → **push an issue** (no throw yet)
3. **Result** — two possible outcomes:
   - `name: 'ab'` (as above) → step 2 failed → Zod collects every pushed issue and throws them together as **one** `ZodError`.
   - `name: 'abcd'` → step 2 would pass → `.parse()` returns `{ name: 'abcd' }`, no throw.

A Zod schema is, at runtime: **one type rule THEN a check list**, run in order, the check list only run once the type rule already passed.

`.refine()` adds to that **same check list**, at step 2. Placed after whichever built-in checks precede it.

### 2. `.refine()` — add a custom check

`.refine()`'s function must return `true`/`false` — same contract as every built-in check.

```ts
const bookingSchema = z
  .object({
    startDate: z.string(),
    endDate: z.string(),
  })
  .refine((value) => new Date(value.endDate) >= new Date(value.startDate), {
    error: 'endDate must be on or after startDate',
    path: ['endDate'],
  });

bookingSchema.parse({ startDate: '2026-01-10', endDate: '2026-01-05' });
```

1. **Declare** — `z.object({ startDate, endDate })` builds the type rule (object with two string fields). `.refine(fn, { error, path })` adds **one check** to the check list.
2. **Parse** — `bookingSchema.parse({ startDate: '2026-01-10', endDate: '2026-01-05' })` executes:
   - run the type rule → object with two strings → pass → continue
   - run the check list → `check[0]` = the `.refine()` function → `new Date('2026-01-05') >= new Date('2026-01-10')` → `false` → **push an issue**.
     - using `error` as its message and `path: ['endDate']` as which field it attaches to.
     - `path` is issue to `endDate` instead of the whole object. Without it, the issue would attach to the object itself.
3. **Result** — two possible outcomes:
   - as above → `.parse()` throws a `ZodError` with one issue: `{ message: 'endDate must be on or after startDate', path: ['endDate'] }`
   - if `endDate: '2026-01-15'` instead → no issue pushed → `.parse()` returns the object, no throw

---

## Why

Each request shape is written **once** as a Zod schema; the `ZodValidationPipe` parses every incoming request against **that schema** at the boundary — before the controller method runs. So by the time **the handler** executes, Zod has already checked every field and stripped or rejected unknown keys. The handler therefore never sees malformed data and never re-validates: it can treat its input as well-formed and correctly typed.

---

## How

1. Declare every request shape as a Zod schema `<action>Schema` in `@vinaup-platform/validation`; export its inferred twin `<Action>RequestInterface` from `interfaces/`. → [Coding Convention §6](../CODING-CONVENTION.md#6-request--response-data-shapes)
2. **Derive, don't restate** — update = `schema.partial()`; filter = compose shared shapes by spread / `.pick()`. → [DTO Pattern](DTO-PATTERN.md)
3. Use `z.strictObject` for request schemas so unknown keys are rejected.
4. **Gate by the column** — `.optional()` (accepts `undefined` only; optional non-nullable), `.nullable()` (accepts `null` only; required nullable), `.nullish()` (both; optional nullable). The builder must match the Prisma column, and `.optional()` on a `NOT NULL` field rejects `null` at the pipe (400) instead of letting it 500 at the DB. → [Optionality & nullability](#optionality--nullability-gating-undefined-and-null)
5. **Messages are Vietnamese** — the package barrel installs `z.config(z.locales.vi())`; write a `{ error: '…' }` override only where the locale default reads poorly for the field. → [Vietnamese messages](#vietnamese-messages-locale--per-field-overrides)
6. Bridge into the API with `class <Action>Request extends createZodDto(<action>Schema)`; never restate rules in the controller.
7. Register `ZodValidationPipe` once globally; nothing else to wire.
8. Existence, ownership, state-machine, and DB-dependent cross-field rules go in the service or a guard; a pure cross-field rule (no I/O) uses a schema `.refine()`. → [Guard Pattern](GUARD-PATTERN.md) · [Custom validation](#custom-validation-refine)
9. Let Zod's issue path name the field; the global pipe and exception filter surface it. → [Exception Filter Pattern](EXCEPTION-FILTER-PATTERN.md)
