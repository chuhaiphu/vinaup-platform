# Date & Time Pattern

## What

### 1. The theory: a timestamp is ONE instant; a timezone is a LENS

A `Date` (JS) / `DateTime` (Prisma) / `timestamp` (Postgres) is **not** a date string like
"30/04/2026 08:00". It is a single number — **milliseconds since the Unix epoch
(1970-01-01 00:00:00 UTC)** — one absolute point on the world timeline, with **no timezone
attached**

A **timezone is only a lens** — the number itself never changes:

```
  CREATE                            DATA             DISPLAY
  human text, with a timezone  ──►  the number  ──►  human text, seen through a timezone
  "30/04 00:00 in UTC+7"            (immutable)      UTC lens → "29/04 17:00"
                                                     VN  lens → "30/04 00:00"
                                                     NY  lens → "29/04 13:00"
```

- The lens at **create** decides _which number is born_: the same text "30/04 00:00" becomes
  a **different** instant depending on the timezone we read it in.
- The lens at **display** only changes the _text_, never the number.

**Two kinds of temporal value** (the distinction that drives every decision):

| Concept           | Meaning                                 | Has time-of-day? | Has a timezone?                   |
| ----------------- | --------------------------------------- | ---------------- | --------------------------------- |
| **Instant**       | a precise moment ("signed at 14:35")    | yes              | yes — stored UTC, shown in a lens |
| **Calendar date** | a label on a wall calendar ("the 30th") | no               | none — same for everyone          |

### 2. On the client (device)

- A client app runs in the **device's local timezone** (the OS provides it). That local zone
  is the **viewer's lens**: a record should read in the local time of whoever looks at it.
- JavaScript `Date` and every date library (Day.js, Moment, date-fns) operate in **local time
  by default**; producing UTC is an _explicit_ method (`.toISOString()`), which is the UTC lens and always ends in `Z`.
- So a client reads user input through the device-local lens and displays through it; to
  talk to a server it serializes the instant to UTC.

> **Example.** A user picks "30/04/2026" on device at UTC+7. `dayjs(...).toISOString()`
> → `"2026-04-29T17:00:00.000Z"`.Viewed back through the **VN lens** it reads
> "30/04 00:00"; through the **UTC lens** it reads "29/04 17:00".

### 3. In the database (PostgreSQL + Prisma)

Postgres has two timestamp types — same 8-byte storage, **different lens behavior**:

| Type                     | On input                                               | On read / conversion              | Meaning                                        |
| ------------------------ | ------------------------------------------------------ | --------------------------------- | ---------------------------------------------- |
| `timestamp` (without tz) | stores the wall-clock as-is, **drops** any offset      | never converts                    | "a clock reading with no timezone" — ambiguous |
| **`timestamptz`**        | converts input to **UTC** using its offset, stores UTC | converts UTC → session `TimeZone` | "an absolute instant" — unambiguous            |

The PostgreSQL project itself recommends `timestamptz` for almost all cases (PostgreSQL wiki, _"Don't Do This → Don't use timestamp (without time zone)"_).
**Prisma** maps a `DateTime` to `timestamp(3)` **by default** on PostgreSQL (no timezone!), so a project must opt
into `timestamptz` explicitly; Prisma Client itself always reads/writes `DateTime` as UTC `Date` objects.

---

## In this codebase

> **Every temporal field is an _instant_** (booking/tour/project/invoice
> `start`/`end`, `transactionDate`, `joinedAt`, `signedAt`, `createdAt`, …).

This service uses **Prisma + PostgreSQL**. The backend's whole job with time is to **store and compare instants** — it never decides which calendar day an instant belongs to.

- **Storage:** every temporal column is `DateTime @db.Timestamptz(3)` in `src/prisma/schema.prisma`.
- **Why `timestamptz`:** values generated _inside_ the DB — `@default(now())` → `CURRENT_TIMESTAMP` — are produced using the DB session's `TimeZone`. On a non-UTC server a plain `timestamp` column would store defaults in _local_ time while app-written values are UTC, causing silent drift. `timestamptz` removes the ambiguity, so the column is correct no matter who writes it.
- **On the wire:** dates arrive and leave as ISO-8601 strings.

Where date handling lives on this side:

| Concern                          | File                                                                                         |
| -------------------------------- | -------------------------------------------------------------------------------------------- |
| Storage type                     | `src/prisma/schema.prisma` (`@db.Timestamptz(3)`)                                            |
| Validate incoming dates          | `packages/validation/src/zod-schemas/<domain>.schema.ts` (`z.iso.datetime()` + `.refine()`) |
| Filter a date range              | `src/_common/utils/generator/generate-date-overlap-clause.ts`                                |
| Detect a schedule conflict       | `src/trip/services/trip-assignment.service.ts` (`findOverlappingTripAssignments`) and `src/tour/services/tour-implementation-assignment.service.ts` (`findOverlappingTourImplementationAssignments`) — pure instant overlap (Rule 4), NOT a calendar-day bucket; the backend may compute it |
| Ship raw ranges for the calendar | `src/project/services/project.service.ts`, `src/wage/wage.service.ts`                        |

---

## Why

The shared contract: **instants stored in UTC, transmit ISO-8601, _device_ owns every
timezone decision.** The backend's responsibilities:

1. **Store instants in UTC** (`timestamptz`).
2. **Only ever _compare_ instants** (`a <= b`) — comparison is timezone-independent and always correct.
3. **Never compute "which calendar day/month"** — that is _impossible_ without the viewer's timezone, it is the device's responsibilities.

---

## How

### Rule 1 — Storage: every temporal column is `@db.Timestamptz(3)`

```prisma
// src/prisma/schema.prisma
startDate DateTime @default(now()) @db.Timestamptz(3)
endDate   DateTime @db.Timestamptz(3)
createdAt DateTime @default(now()) @db.Timestamptz(3)
```

### Rule 2 — Receiving: validate as an ISO string and check ranges cross-field

Dates arrive as **strings** (ISO-8601), validated with `z.iso.datetime()`.

The range check (`endDate ≥ startDate`) is a cross-field rule with no DB call, so it lives in the schema as a `.refine()`.

```ts
// Returns true (valid) when:
// - either field is missing (because of strictObject)

// packages/validation/src/zod-schemas/booking.schema.ts
const bookingFields = z.strictObject({
  startDate: z.iso.datetime(),
  endDate: z.iso.datetime(),
});

// - endDate is on or after startDate
const endAfterStart = (v: { startDate?: string; endDate?: string }) =>
  !v.startDate || !v.endDate || new Date(v.startDate) <= new Date(v.endDate);

export const createBookingSchema = bookingFields.refine(endAfterStart, {
  message: 'endDate must be on or after startDate',
  path: ['endDate'], // attach the error to the endDate field
});
```

`.refine()` lets us attach **our own validation logic** to any schema.

It takes two arguments:
1. A **validator function** — receives the parsed value, returns `true` (valid) or `false` (invalid).
2. An **error config** — the message to throw when the validator returns `false`.

### Rule 3 — Writing: hand the ISO string straight to Prisma

Prisma coerces the ISO string to a UTC `Date`; no manual conversion. **Never** normalize to
"start/end of day" on the server.

### Rule 4 — Filtering a range: compare instants, never calendar days

```ts
// src/_common/utils/generator/generate-date-overlap-clause.ts
return {
  startDate: { lte: new Date(filter.endDate) }, // record starts before the window closes
  endDate: { gte: new Date(filter.startDate) }, // record ends after the window opens
};
```

The client computes the window edges in its local lens and sends them as instants; the backend
just compares.

### Rule 5 — Aggregation: return raw ranges, compute nothing

The backend never derives calendar-level values (day counts, month buckets, "busy" flags) from
timestamps — doing so requires the viewer's timezone, which the server does not have.
Return raw `{ startDate, endDate }` pairs; the device groups, counts, or colours them locally.

```ts
select: { startDate: true, endDate: true }   // instants only — no computation
```

### End-to-end round trip

```
DEVICE (UTC+7)                         API + POSTGRES                       DEVICE (any tz)
pick 30/04 08:00 ─ toISOString ─► "2026-04-30T01:00:00Z" ─► timestamptz ─► ISO back ─► dayjs().format()
(local lens, create)              (instant on the wire)     (UTC truth)     (local lens, display)
```

---

## References (official)

- MDN — `Date`: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
- ISO 8601 (date-time + offset): https://en.wikipedia.org/wiki/ISO_8601
- PostgreSQL — Date/Time Types: https://www.postgresql.org/docs/current/datatype-datetime.html
- PostgreSQL wiki — _Don't use timestamp (without time zone)_: https://wiki.postgresql.org/wiki/Don%27t_Do_This
- Prisma — Schema reference, `DateTime` & native type mapping: https://www.prisma.io/docs/orm/reference/prisma-schema-reference
- Day.js — UTC plugin (why core is local): https://day.js.org/docs/en/plugin/utc