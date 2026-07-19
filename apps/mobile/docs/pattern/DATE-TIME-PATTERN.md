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

This app uses **Day.js — core only, with no `utc`/`timezone` plugins** (adding them only
makes sense if we deliberately switch to a fixed display timezone — a separate product decision).

- `dayjs(iso)` parses an instant and reads it through the **device-local** lens.
- `.format(...)` renders in device-local; `.toISOString()` applies the **UTC** lens.

Where date handling lives on this side:

| Concern                                    | File                                                                                                 |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Capture date **and** time into one `Dayjs` | `src/components/primitives/date-time-picker.tsx` (+ the modals that use it)                          |
| Compute a filter window                    | `src/providers/.../organization-booking-list-provider.tsx`                                           |
| Display                                    | `src/utils/generator/string-generator/generate-format-date-time.ts`                                  |
| Group "busy days" locally                  | `src/utils/calculator/calculate-busy-days-by-month-in-year.ts` + `.../generate-day-js-date-chain.ts` |
| Talk to the API                            | `src/apis/project/project-apis.ts`, `src/apis/wage/wage-apis.ts`                                     |

---

## Why (the client's half of the contract)

The shared contract: **instants stored in UTC, transmit ISO-8601, _device_ owns every
timezone decision.** The device is the only place that knows the viewer's lens.

1. **Send instants as UTC ISO** (`.toISOString()`).
2. **Display in the device-local lens** — each viewer sees their own local time.
3. **Compute "which calendar day/month" locally** — the backend does not know the viewer's timezone.

Net effect: the same record shows the correct local day for a viewer in Hanoi or New York,
with no configuration.

---

## How

### Rule 1 — Capture a date+time as ONE `Dayjs`, send with `.toISOString()`

A date picker sets year/month/day and a time picker sets hour/minute on the **same** `Dayjs` value.
Always serialize the instant with `.toISOString()` before sending — never a date-only or
locally-formatted string.

### Rule 2 — Compute filter-window edges locally, then `.toISOString()`

```ts
// src/providers/organization/booking/organization-booking-list-provider.tsx
startDate: selectedDate.startOf("month").toISOString(),  // local month start → UTC instant
endDate:   selectedDate.endOf("month").toISOString(),
```

### Rule 3 — Display through the local lens

```ts
// src/utils/generator/string-generator/generate-format-date-time.ts
return dayjs(value).format(format); // device-local; never hand-roll offset math
```

### Rule 4 — Group "which calendar day/month" locally

The backend ships instants only — it never tells you which day a record belongs to.
Read each instant through the local lens and group on-device (`calculate-busy-days-by-month-in-year.ts`).

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
- Day.js — UTC plugin (why core is local): https://day.js.org/docs/en/plugin/utc
- PostgreSQL — Date/Time Types: https://www.postgresql.org/docs/current/datatype-datetime.html
- Prisma — Schema reference, `DateTime` & native type mapping: https://www.prisma.io/docs/orm/reference/prisma-schema-reference