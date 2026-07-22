# DTO Pattern

## What

A Data Transfer Object (DTO) is a plain object that carries data across a boundary between layers or processes. It defines the exact shape of what crosses that boundary and decouples the external contract from the internal domain model.

### In this codebase

A **request DTO** defines what a client must send; a **response DTO** defines what the client receives.

- **Request DTOs are Zod-backed.** The rules live in a Zod schema in the shared `@vinaup-platform/validation` package; the API wraps each schema into a thin class `<Action>Request` with `createZodDto`. → [Validation Pattern](VALIDATION-PATTERN.md)
- **Response DTOs that mirror a stored record are types derived from a Prisma query-args const** — output is typed, not validated. The projection is declared once as `<action><Thing>QueryArgs`; the type `<Action><Thing>Response` is `Prisma.<Model>GetPayload<typeof …>` of it, and the service reuses the same const to query — so the wire shape and the query can't drift.
- **Response DTOs that are computed server-side, not read from the DB** (a token pair, a derived flag bundle) are **hand-written interfaces** in the same `<action>.response.dto.ts` file — there is no query-args const because nothing is queried.

Every domain has a `dtos/` folder holding the API-side DTO classes (request bridges + response shapes), one file per action: `<action>.request.dto.ts` and `<action>.response.dto.ts`.

The full naming rule for all four data-shape artifacts (schema · interface · request DTO · response DTO) lives in **[Coding Convention §6](../CODING-CONVENTION.md#6-request--response-data-shapes)** — this pattern only shows them in use.

> The snippets below use a placeholder `Entity` domain — they show the _shape_ of the pattern, not a real feature.

### Building the request schema

A request shape is a **Zod schema** in `@vinaup-platform/validation`, declared once and shared with the mobile forms. It has three forms, but only **create** is hand-written — update and filter are _derived_ from it. Field-level rules (text/enum/date, optional vs nullable) → [Validation Pattern](VALIDATION-PATTERN.md).

**Create** — the base schema, the single place fields and rules are written:

```ts
// packages/validation/src/zod-schemas/entity.schema.ts
export const createEntitySchema = z.strictObject({
  name: z.string().trim().min(1), // required
  status: z.enum(ENTITY_STATUS), // required enum
  note: z.string().nullable(), // required, but null clears it
  parentId: z.string().optional(), // optional, non-nullable
});
```

**Update** — the create schema made partial; the field list and rules are never restated:

```ts
export const updateEntitySchema = createEntitySchema.partial();
```

`.partial()` makes every field optional while preserving its rules **including nullability**, so nullability is declared once, on the create schema. → [Validation Pattern: Optionality & nullability](VALIDATION-PATTERN.md#optionality--nullability-gating-undefined-and-null)

**Filter** — composed from the shared field set, with the cross-field rules attached last (a spread copies fields, never refinements):

```ts
export const entityFilterSchema = z
  .strictObject({
    ...dateInstanceFilterFields, // shared `_shared/date-filter.schema.ts`, reused by every date-range list
    status: z.enum(ENTITY_STATUS).optional(),
  })
  .refine(isStartDatePresentWhenEndDate, {
    error: 'startDate is required when endDate is provided',
    path: ['startDate'],
  })
  .refine(isEndDatePresentWhenStartDate, {
    error: 'endDate is required when startDate is provided',
    path: ['endDate'],
  });
```

### Request DTOs are taken from the schema

The API **does not re-declare any rules**. Each request DTO is the matching schema wrapped with `createZodDto` — a zero-logic bridge that gives NestJS a class while the rules still come from the one schema. One file per action:

```ts
// apps/api/src/entity/dtos/create-entity.request.dto.ts
import { createZodDto } from 'nestjs-zod';
import { createEntitySchema } from '@vinaup-platform/validation';
export class CreateEntityRequest extends createZodDto(createEntitySchema) {}

// update-entity.request.dto.ts
export class UpdateEntityRequest extends createZodDto(updateEntitySchema) {}

// entity-filter.request.dto.ts
export class EntityFilterRequest extends createZodDto(entityFilterSchema) {}
```

### Response DTOs derive from a query-args const

A response type is never hand-written. The projection is declared once as a const, typed with
`satisfies Prisma.<Model>DefaultArgs` (Prisma's [recommended form](https://www.prisma.io/docs/orm/prisma-client/type-safety/operating-against-partial-structures-of-model-types) — a plain object + `satisfies`, **not** `Prisma.validator`), and the response type is `GetPayload` of it:

```ts
// src/organization/dtos/organization-profile.response.dto.ts
export const organizationProfileQueryArgs = {
  select: { name: true },
} satisfies Prisma.OrganizationDefaultArgs;

export type OrganizationProfileResponse = Prisma.OrganizationGetPayload<
  typeof organizationProfileQueryArgs
>;
```

The service **reuses the same const** so the query and the type can't drift:

```ts
// src/organization/organization.service.ts
const organization = await this.prismaService.organization.findUnique({
  where: { id },
  ...organizationProfileQueryArgs, // or: select: organizationProfileQueryArgs.select
});
```

Select the **same** fields the service must read — a field needed only for server-side gating rides along
on the response rather than being narrowed out, as long as it is not a secret. Add a second, internal
query-args const only when the response genuinely must hide a fetched field (e.g. a `password` hash read
for verification). → [Coding Convention §6](../CODING-CONVENTION.md#6-request--response-data-shapes)

### Computed responses are hand-written interfaces

Not every response mirrors a row. A payload assembled server-side — a token pair, a set of derived flags — is never queried, so there is no query-args const and no `GetPayload`: it is a plain interface declared next to the query-derived types in the same `<action>.response.dto.ts`. Both kinds can coexist in one file:

```ts
// src/auth/dtos/sign-in.response.dto.ts
export const signInUserQueryArgs = { select: { id: true, email: true } } satisfies Prisma.UserDefaultArgs;
export type SignInUserResponse = Prisma.UserGetPayload<typeof signInUserQueryArgs>; // from the DB

// Issued tokens — computed, never read from a column → a hand-written interface:
export interface SignInTokenResponse {
  accessToken: string;
  refreshToken: string;
}
```

### Response meta and the response envelope

A response DTO declares the entity shape. When an endpoint must return per-record, request-context flags (e.g. "can _this_ caller edit this record?"), the DTO is paired with a `Meta` interface that extends `BaseMeta`, plus a per-module `WithMeta` alias that merges the two:

```ts
// src/booking/dtos/booking.response.dto.ts
export interface BookingMeta extends BaseMeta {
  // BaseMeta guarantees `canEdit`
  isSender?: boolean;
  isSenderSigned?: boolean;
  isReceiverSigned?: boolean;
}

// Per-module shorthand: the entity merged with its meta. Endpoints reference this
// directly, so the meta shape is declared once next to the response DTO.
export type BookingWithMeta = BookingResponse & { meta: BookingMeta };
```

Every response is wrapped in a uniform envelope, defined once and shared across all endpoints. `BaseMeta` lives here too — it guarantees every `Meta` carries `canEdit`, while each domain declares its own `XxxWithMeta` alias next to its response DTO:

```ts
// src/_common/interfaces/interface.ts
export interface HttpResponse<T> {
  message: string;
  statusCode: number;
  data?: T;
}
export interface BaseMeta {
  canEdit: boolean;
}
```

Because the per-record meta is gathered into each item (`...entity, meta: { … }`), an array endpoint gives every element its own `meta` block — the same convention as [JSON:API resource `meta`](https://jsonapi.org/format/#document-resource-objects):

```jsonc
{
  "message": "Bookings retrieved successfully",
  "statusCode": 200,
  "data": [
    { "id": "bk_123", "status": "CONFIRMED", "meta": { "canEdit": true, "isSender": true } },
    { "id": "bk_124", "status": "SIGNED", "meta": { "canEdit": false, "isSender": true } },
  ],
}
```

> Responses are typed, not validated. If an output shape must be guaranteed at runtime, nestjs-zod's `ZodSerializerDto` is the tool — but default to plain types.

---

## Why

DTOs make the wire contract explicit and reviewable in one place, independent of how data is stored or computed internally. Deriving update and filter schemas from shared bases (`.partial()`, shape spreads, `dateInstanceFilterFields`) means each field and rule is written once; sharing the schema across apps means the contract can't drift between client and server.

---

## How

1. **Request shape = a Zod schema** in `@vinaup-platform/validation`; its interface comes from `z.infer`. → [Validation Pattern](VALIDATION-PATTERN.md)
2. **Derive, don't restate** — update = `createSchema.partial()`; filter = compose shared shapes by spread.
3. **Reuse shared params** — date-range filtering spreads `dateInstanceFilterFields`; do not redeclare `startDate`/`endDate`.
4. **Bridge into the API with `createZodDto`** — name DTOs by role; controllers reference the DTO class only.
5. **Derive the response type from a query-args const** — declare `<action><Thing>QueryArgs = { select: { … } } satisfies Prisma.<Model>DefaultArgs`, type it `Prisma.<Model>GetPayload<typeof …>`, and reuse the const in the service query. Split into a wider query const + a narrower wire const when the response is a strict subset of what the query must fetch.
6. **Pair a response DTO with a `Meta extends BaseMeta`** when the endpoint returns per-record flags; expose a per-module `XxxWithMeta = XxxResponse & { meta: XxxMeta }` alias and compute the meta in the service.
7. **Never redefine the envelope** — return `HttpResponse<T>` / `HttpResponse<XxxWithMeta[]>`; the `HttpResponse` envelope and `BaseMeta` live in `_common/interfaces`, the `XxxWithMeta` alias next to each response DTO.
8. **Choose a request field's builder to match the column** — `.optional()` / `.nullable()` / `.nullish()` decide how `undefined` and `null` are accepted or rejected; this is a validation concern. → [Validation Pattern: Optionality & nullability](VALIDATION-PATTERN.md#optionality--nullability-gating-undefined-and-null)

---
