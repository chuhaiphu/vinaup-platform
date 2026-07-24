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

A calendar date has **no time-of-day and no timezone** — "the 30th" is the 30th everywhere. So on
device it behaves like plain text, not like a `Dayjs` moment:

We **never** parse it with `dayjs(value)` to read a local day, and **never** serialize it with `.toISOString()`. A wrong device clock or timezone must not be able to move the day.

---

## In this codebase

- **Day.js — core only, unchanged.** No `utc`/`timezone` plugin is ever needed for a calendar date,
  because the device does no timezone math for it.
- **On the wire:** a calendar date is a bare `YYYY-MM-DD` string, matching the API's `z.iso.date()`
  and a `String` `YYYY-MM-DD` column — never an ISO date-time.
- Pressing check-in sends **no timestamp**; the server returns the record
  with a `workDate` the device renders as-is. Loading a day's roster sends that `workDate`.

---

## Why

The two guarantees a calendar date exists for — **integrity** (un-gameable: the server stamps the
instant, not the phone) and **consistency** (one day for everyone: the org timezone, applied once) —
are **server-side properties**.

---

## How

### Rule 1 — Never derive the day on-device; let the server ship it

For a derived calendar date, send the event with **no time** and read `workDate` back from the
response. Do not compute "which day is it" from `Date.now()` or `dayjs()` — that would reintroduce the
device clock/timezone the server pattern exists to remove.

```ts
// check-in: send no timestamp — the server stamps now() and derives workDate
await checkIn({ organizationId });
```

### Rule 2 — Address a day with a bare `YYYY-MM-DD`

To ask about one business day (load its roster, write its conclusion), send the date-only string —
**not** `.toISOString()`.

```ts
// load one workday's roster
await getAttendance({ organizationId, workDate: "2026-05-01" });
```

### Rule 3 — Display: label verbatim, companion time in the org lens

- **`workDate`** (calendar date) — show the stored string as-is; never `dayjs(value).format(...)` it.
- **`checkInAt` / `checkOutAt`** (instants) — display like any instant, but with the lens fixed to the
  **organization's** timezone (not the device's), so the time stays consistent with `workDate`.

```ts
workDate; // "2026-05-01" — verbatim

// instant in the ORG lens — Intl, no Day.js plugin
new Intl.DateTimeFormat('vi-VN', { timeZone: orgTimezone, hour: '2-digit', minute: '2-digit' })
  .format(new Date(checkInAt)); // → "00:30"
```

> ⚠️ Confirm Hermes `Intl` supports `timeZone` in this build; if not, show a string the server
> pre-formatted in the org lens. Day.js stays **core only**.

### Rule 4 — Never re-group a shipped day

Unlike an instant (which the device groups locally — [Instant Rule 4](INSTANT-TIME-PATTERN.md)), a
`workDate` is already the canonical day. Group and count on it as-is; never recompute it from any
timestamp on the record.

### End-to-end round trip

```
DEVICE                     API + POSTGRES  (one press → two stored values)        DEVICE (any tz)
press check-in ──► now() ┬─ checkInAt  "2026-04-30T17:30:00Z"  @Timestamptz   ─► org lens → "00:30"
(sends no time)          └─ workDate   "2026-05-01"            String         ─► verbatim → "2026-05-01"
                            workDate = checkInAt from the org timezone
```

---

## References (official)

- IANA Time Zone Database (server-side; the device needs none): https://www.iana.org/time-zones
- Day.js — why core is device-local: https://day.js.org/docs/en/plugin/utc
- ISO 8601 (calendar date `YYYY-MM-DD`): https://en.wikipedia.org/wiki/ISO_8601
