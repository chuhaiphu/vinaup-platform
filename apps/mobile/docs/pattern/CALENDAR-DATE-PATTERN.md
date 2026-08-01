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
// check-in: send no timestamp — the server stamps now() and derives workDate.
// `mode`, `note` and `location` are what the user chose/typed; none of them is a time.
await createAttendanceRecord({ organizationId, mode, note, location });
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
// wrapped as generateZonedTime(instant, timeZone) in src/utils/generator/string-generator/
new Intl.DateTimeFormat('vi-VN', { timeZone: orgTimezone, hour: '2-digit', minute: '2-digit' })
  .format(new Date(checkInAt)); // → "00:30"
```

**A still-open session has no end instant.** An `OPEN` `AttendanceRecord` has `checkOutAt === null`,
so its elapsed total counts from `checkInAt` up to **now**, and the missing end time renders as a
placeholder rather than a fabricated one:

```ts
// AttendanceRecordCard — CLOSED stops at checkOutAt, OPEN keeps counting
generateDurationText(
  calculateDurationInMinutes(new Date(checkInAt), checkOutAt ? new Date(checkOutAt) : now),
); // → "3h21"
```

`now` is passed **in** from the list (`useCurrentMinute()` called once in
`AttendanceRecordListSection`), so one timer drives every open card instead of one timer per card.

### Rule 4 — Never re-group a shipped day

Unlike an instant (which the device groups locally — [Instant Rule 4](INSTANT-TIME-PATTERN.md)), a
`workDate` is already the canonical day. Group and count on it as-is; never recompute it from any
timestamp on the record.

### Rule 5 — Gate a punch affordance on the live workDate, compared in the org lens

A check-in control may only render when the day **on screen** is the day the server would stamp
right now. Both sides of that comparison must be calendar dates in the **organization's** lens — the
device's own lens is never one of them, or a user in another timezone could punch into yesterday.

```ts
const todayWorkDate = generateCalendarDate(now, organizationTimezone); // "2026-05-01"
const selectedWorkDate = workDate ?? todayWorkDate;
const isLiveWorkDate = selectedWorkDate === todayWorkDate;

{isLiveWorkDate && <AttendancePunchBar … />}   // punch controls; hidden on any other day
```

`generateCalendarDate(instant, timeZone)` is the device-side mirror of the server's derivation — the
**same** `Intl` formatter with `en-CA` (which yields `YYYY-MM-DD`), so the two agree by construction.

This gate is **UI-UX only** ([UI Action Gating Pattern](UI-ACTION-GATING-PATTERN.md)): the server
re-derives `workDate` itself and rejects a punch on a locked day, so a stale screen cannot forge one.
Combine it with the RBAC gate — the punch bar also requires `can(CREATE, ATTENDANCE_RECORD)`.

**A session outlives its own workDate — so don't look for it by day.** The server keeps at most one
`OPEN` record per **organization member across all days** (`assertNoOpenAttendanceRecord` filters on
`status` only, never on `workDate`). That is what lets an overnight shift check out the next morning
with its `workDate` still frozen at check-in.

The consequence for the device: "is a session still open?" **cannot** be answered from the day in
view. A session opened yesterday is absent from today's list, so deriving it from that list would
make the punch bar offer *check in*, which the server then refuses with `ATTENDANCE_HAS_OPEN_RECORD`
— and the session could never be closed, because the bar renders only on the live day.

So the open session is fetched **separately and unbounded by day**, using the filter's `status`, and
keyed without `workDate` so it survives day changes:

```ts
// day-scoped — what the list renders
getMyAttendanceRecords({ organizationId, workDateFrom: workDate, workDateTo: workDate });

// day-independent — what decides the next punch action
getMyAttendanceRecords({ organizationId, status: ATTENDANCE_RECORD_STATUS.OPEN });
```

Both carry `FETCH_TAG.attendanceRecordList`, so either punch refreshes both.

### Rule 6 — A concluded day is frozen, and its total stops coming from the punches

One `(member, workDate)` may carry an `AttendanceConclusion` — the manager's hand-entered verdict.
Its `status` is not a label; `COMPLETED` changes what the day *is*:

- Every still-`OPEN` record of that member and day is force-closed, and its **`checkOutAt` is set to
  `null`** — the running session loses its end instant rather than gaining one.
- The API then refuses every check-in, check-out, edit and delete on that `(member, workDate)` with
  `ATTENDANCE_DAY_LOCKED`.
- Deleting a `COMPLETED` conclusion is refused with `ATTENDANCE_CONCLUSION_LOCKED`, because deleting
  it would silently unfreeze the day.

**What `COMPLETED` freezes is the workday, not the verdict.** The conclusion itself stays editable:
`assertDayNotLocked` reads `status` straight off the conclusion, so the freeze holds without the
conclusion having to lock itself. Refusing the update as well would only force a correction to a
single metric to travel as `status: DRAFT`, which unlocks the whole day as a side effect — the
manager fixes a typo and the day silently becomes punchable again. So a metric may be corrected in
place, and only an explicit move back to `DRAFT` reopens the day.

Two consequences for the device:

**A `CLOSED` record with no `checkOutAt` has no span.** It is either a lone `CHECK_IN` punch (an
instant) or a force-closed session. Neither may be totalled up to `now` — that would invent an end
the server deliberately erased. `calculateAttendanceTotalMinutes` counts only a real `checkOutAt`,
plus `OPEN` records up to `now`.

**Once concluded, the punches stop being the answer.** The card and the conclusion bar show the
manager's figures instead of the punch total. Those figures stay in **their own units** — the
conclusion has no total-hours column, and none can be derived, because `workdayUnit` is measured in
days and nothing in the domain states how many hours a workday is:

```ts
attendanceConclusion
  ? generateAttendanceConclusionSummary(attendanceConclusion)          // "1 công - 2h TC"
  : generateDurationText(calculateAttendanceTotalMinutes(records, now)) // "7h30"
```

A conclusion write therefore invalidates the record list too (`getAttendanceConclusionRippleTags`),
since completing one rewrites records the device is already showing.

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
