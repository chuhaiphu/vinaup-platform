# Calendar-Date Pattern

> One of **two** temporal patterns. This one covers the **calendar date** — a wall-calendar label
> ("the 30th") anchored to a **fixed** lens, the **same** for everyone. Its counterpart,
> [Instant Time Pattern](INSTANT-TIME-PATTERN.md), covers the **instant** — a precise moment read
> through the **viewer's** lens.

## When to use — Calendar-Date vs Instant

One question decides it: **whose lens owns the value?** Reach for
**this** pattern when a value must read the **same** for everyone because it is pinned to the
business:

- A **payroll / attendance workday** — "which working day this punch counts for". The answer must be
  identical for the employee, the owner, and the payroll report, and it must **not** be gameable by a
  phone's clock or timezone.
- A **cutoff / accounting date** — "which business day this transaction settles on".
- A **plain date with no moment** — a birthday, a holiday: a label the user types, never a timestamp.

## What

### 1. A calendar date is a label, not a moment

Recall ([Instant §1](INSTANT-TIME-PATTERN.md)): an **instant** is a
point on the world timeline (has a time-of-day, lives in UTC, shown through a lens).

A **calendar date** is a label on a wall calendar — **no time-of-day, no timezone, the same for everyone**. "The
30th" is the 30th in Hanoi and in New York alike.

Because it carries no timezone, a calendar date is **not** stored as `timestamptz` and is **never**
read through the viewer's lens. It is stored and shipped as a plain date and displayed verbatim.

### 2. Two ways a calendar date is born

| Origin | How the label is produced | Example |
| --- | --- | --- |
| **Entered** | the user types a date directly; no instant involved | birthday, holiday  |
| **Derived** | the server takes an **instant** and reads its day **through a fixed lens** | attendance `workDate` from `checkInAt` |

The **derived** case rests on **two guarantees**:

1. **The source instant is un-gameable** — the *server* stamps it, never the device.
2. **The lens is fixed and canonical** — the day is read in the **organization's timezone**, a stored
   business fact, not the viewer's device timezone. So the same instant yields the same day for
   everyone, forever.

```
  derive(instant, orgTimezone) = the DATE (part of instant read through orgTimezone)

  2026-04-30T17:30:00Z  +07:00 (Asia/Ho_Chi_Minh)  -→  2026-05-01 00:30 local  -→  workDate = 2026-05-01
```

---

## In this codebase

This service uses **Prisma + PostgreSQL**. A calendar-date value is stored, compared, filtered, and
**aggregated** by the backend — the opposite of an instant.

- **The lens:** `Organization.timezone` — one IANA-name column per organization, the canonical lens
  for every derived calendar date in that organization.
- **Storage:** a calendar-date column is `DateTime @db.Date` (Postgres `date` — date-only, no
  timezone). Its **source instant**, when there is one, stays `DateTime @db.Timestamptz(3)` and is
  server-stamped ([Instant Rule 1](INSTANT-TIME-PATTERN.md)).
- **On the wire:** a calendar date arrives and leaves as a **date-only** `YYYY-MM-DD` string
  (`z.iso.date()`), never an ISO date-time and never through `.toISOString()`.

`AttendanceRecord.workDate` is derived from a server-stamped
`checkInAt` in the organization's timezone; monthly statistics group conclusions by `workDate`.

---

## Why

A calendar date is a **separate** pattern, not a bent instant, for two reasons the Instant contract
cannot give:

1. **Integrity (un-gameable).** Attendance, payroll and cutoffs decide money. The moment a value
   drives money, its source instant must be the server's `now()`, not a client clock.
2. **Consistency (one answer for all).** A workday must be the same for the employee, the owner, and
   the report. That requires a single fixed lens (the org timezone), applied **once at write** and
   frozen — not re-derived per viewer.

---

## How

### Rule 1 — Storage: the label is `@db.Date`; its source instant is server-stamped `@db.Timestamptz(3)`

```prisma
// src/prisma/schema.prisma
model Organization {
  timezone String // IANA name, e.g. "Asia/Ho_Chi_Minh" — the canonical lens
}

model AttendanceRecord {
  checkInAt DateTime @default(now()) @db.Timestamptz(3) // source instant — server-stamped
  workDate  DateTime @db.Date                            // derived label — frozen at write
}
```

### Rule 2 — Deriving: read the instant through the org lens, **at write time**, once

Never trust the client for either half. The server stamps the instant, loads the org lens, takes the
date part, and stores it. A dependency-free way to read a UTC instant's date in a named timezone is
`Intl.DateTimeFormat` with the `en-CA` locale (which formats as `YYYY-MM-DD`):

```ts
// derive on create — never on read
const checkInAt = new Date(); // server now() — the un-gameable instant
const workDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: organization.timezone, // the canonical lens
}).format(checkInAt); // → "2026-05-01"
```

For the **entered** case (a birthday) there is no instant and no derivation — validate the incoming
`YYYY-MM-DD` with `z.iso.date()` and store it verbatim.

### Rule 3 — Freezing: never re-derive on read, and never on a later write

Once stored, `workDate` is authoritative. A read returns it verbatim — no timezone math. A *later*
write on the same row (e.g. an attendance check-out that fills `checkOutAt`) stamps its own instant
but **must not** recompute `workDate`; the session belongs to the day it began. This is what makes a
punch at 23:50 → 00:10 count as **one** workday, not two.

### Rule 4 — Addressing a day: send a date-only string, filter by the stored column

To ask about one business day (load a day's roster, lock a day, write that day's conclusion) the
client sends a **date-only** `YYYY-MM-DD`; the server matches it against the stored `workDate` column
directly — no instant range, no bucketing of timestamps.

```ts
// validation: a calendar date on the wire
workDate: z.iso.date(), // "2026-05-01" — NOT z.iso.datetime()

// query: match the stored label, not an instant window
where: { organizationMemberId, workDate: new Date(filter.workDate) }
```

### Rule 5 — Aggregation: the backend MAY group and count by the calendar date

This is the mirror image of [Instant Rule 5](INSTANT-TIME-PATTERN.md). Because the label is already a
fixed, viewer-independent day, the server groups, counts, and sums by it — that is the whole point
(monthly công totals, late/early counts). No viewer timezone is needed or wanted.

```ts
// monthly stats: group by the calendar date, server-side
groupBy: ['organizationMemberId', 'workDate'] // legitimate — workDate is canonical
```

### Rule 6 — Displaying: label verbatim, companion instant in the org lens

- **`workDate`** — show the stored label as-is; no timezone math.
- **`checkInAt` / `checkOutAt`** — render in the **organization's** timezone, not the viewer's, so the
  time stays consistent with `workDate`. Use `Intl` (`timeZone`, no Day.js plugin) or a server-formatted string.

```ts
new Intl.DateTimeFormat('vi-VN', { timeZone: organization.timezone, hour: '2-digit', minute: '2-digit' })
  .format(checkInAt); // → "00:30"  (matches workDate 2026-05-01)
```

### End-to-end round trip

```
DEVICE                     API + POSTGRES  (one press → two stored values)     DEVICE (any tz)
press check-in ──► now() ┬─ checkInAt  "2026-04-30T17:30:00Z"  @Timestamptz ─► org lens → "00:30"
(sends no time)          └─ workDate   "2026-05-01"            @db.Date     ─► verbatim → "2026-05-01"
                            workDate = checkInAt from the org timezone
```

---

## References (official)

- IANA Time Zone Database (the names in `Organization.timezone`): https://www.iana.org/time-zones
- MDN — `Intl.DateTimeFormat` (`timeZone` option): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
- PostgreSQL — Date/Time Types (`date`): https://www.postgresql.org/docs/current/datatype-datetime.html
- Prisma — Schema reference, `@db.Date` native type mapping: https://www.prisma.io/docs/orm/reference/prisma-schema-reference
- Zod — `z.iso.date()`: https://zod.dev/api
