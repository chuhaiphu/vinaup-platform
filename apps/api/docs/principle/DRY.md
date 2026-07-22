# DRY — Don't Repeat Yourself

## What

Don't Repeat Yourself is a software design principle stating that every piece of knowledge should have a single representation in the system. Duplication forces us to maintain multiple copies of the same decision — when the requirement changes, every copy must be found and updated consistently, and certainty about completeness shrinks with every extra copy.

### In this codebase

### 1. `as const` objects + derived union type

Enumerated string values are declared once as a frozen object, and the matching TypeScript type is _derived_ from that object — so the values and the type can never drift apart. An enum referenced by a shared Zod schema lives in `@vinaup-platform/validation` (`src/constants/`); an API-only enum lives in `src/_common/constants/`.

```ts
// packages/validation/src/constants/booking.constant.ts
export const BOOKING_STATUS = {
  DRAFT: 'DRAFT',
  SENDER_SIGNED: 'SENDER_SIGNED',
  COMPLETED: 'COMPLETED',
} as const;

export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];
// type BookingStatus = 'DRAFT' | 'SENDER_SIGNED' | 'COMPLETED'
```

Consumers import the object for values (`BOOKING_STATUS.COMPLETED`) and the type for annotations — never a bare string literal. → [Coding Convention §1.3](../CODING-CONVENTION.md)

### 2. Shared schemas via `.partial()`

An update schema is the create schema made partial, so the field list and every rule are written once.

```ts
// packages/validation/src/zod-schemas/booking.schema.ts
export const updateBookingSchema = createBookingSchema.partial();
```

### 3. Shared parameter schemas

Cross-cutting request shapes live in `packages/validation/src/zod-schemas/_shared/`, not re-declared per domain.

```ts
// _shared/date-filter.schema.ts — used by every list endpoint that filters by date range.
// A field SET (not a schema): a spread copies fields but never refinements, so the
// cross-field rule ships separately and each filter schema attaches it last.
export const dateInstanceFilterFields = {
  startDate: z.iso.datetime().optional(),
  endDate: z.iso.datetime().optional(),
};

// both-or-neither: each end is required as soon as the other is provided —
// two predicates, so each filter schema attaches them as two plain .refine() checks.
export const isStartDatePresentWhenEndDate = (value) => !value.endDate || Boolean(value.startDate);
export const isEndDatePresentWhenStartDate = (value) => !value.startDate || Boolean(value.endDate);
```

### 4. Reusable schema fragments & existence checks

Recurring field rules are written once as Zod fragments and composed into request schemas (e.g. the shared `VN_PHONE_REGEX`, `dateInstanceFilterFields`). Existence checks ("does this id exist?") are **not** duplicated as a per-field rule — they live once in the service/guard that owns the entity. → [Validation Pattern](../pattern/VALIDATION-PATTERN.md)

### 5. Shared pure helpers in `_common/utils/`

Logic that recurs is extracted into `src/_common/utils/`, organised by concern:

| Subdirectory                  | Concern                                                          |
| ----------------------------- | ---------------------------------------------------------------- |
| `generator/`                  | building a value/clause (e.g. `generate-date-overlap-clause.ts`) |
| `generator/string-generator/` | string formatting (e.g. `generate-unique-code.ts`)               |

→ [Coding Convention §2.3](../CODING-CONVENTION.md)

---

## Why

When a piece of knowledge lives in one place, fixing a bug or changing behaviour touches exactly one file, and the compiler propagates the change to every caller. When the same decision is duplicated — a date-filter clause, a Prisma `include` block, a status string — a change requires finding every copy by hand, and a missed copy becomes a silent inconsistency.

---

## How

1. **Extract when the same decision appears in 2+ places** — identical logic, not merely similar-looking code.
2. **Enumerated values belong in a `constants/` folder** as `as const` objects with a derived type — shared ones in `@vinaup-platform/validation`, API-only ones in `src/_common/constants/`; never inline string literals.
3. **Reusable validation belongs in a shared Zod schema/fragment** — composed into request schemas; existence and DB-dependent checks live in the service/guard, not duplicated per field.
4. **Pure helpers belong in `src/_common/utils/`** under the right concern folder — not copy-pasted into services.
5. **Update schemas = `createSchema.partial()`** — do not restate fields.
6. **Do not DRY prematurely** — wait until a thing genuinely appears in 2+ places before extracting.
7. **Do not DRY intentionally verbose.** For code that needs explicit repetition to be readable and debuggable without tracing any abstraction, this is intentional verbosity, not a DRY violation.

---
