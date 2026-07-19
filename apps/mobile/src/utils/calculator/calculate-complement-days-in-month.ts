import dayjs from 'dayjs';

/**
 * Compute the COMPLEMENT of a set of days within a month — every day-of-month
 * (1..daysInMonth) that does NOT appear in the input set.
 *
 * Only the day-of-month is compared when matching input strings — the caller
 * must ensure every entry in `inputDayIsoStrings` falls within the same month
 * as `dayJsMonth`, otherwise dates from neighboring months will be treated as
 * matches.
 *
 * @param dayJsMonth - A `dayjs` anchored at the target month. Should be
 *   normalized via `.startOf('month')` so that `.date(d)` in the loop never
 *   overflows into the next month (e.g. if `dayJsMonth` carried day=31 and the
 *   target month had only 30 days).
 * @param inputDayIsoStrings - ISO timestamps of days within `dayJsMonth`'s
 *   month to EXCLUDE from the result (e.g. `"2026-03-05T00:00:00.000Z"`).
 * @returns Array of `dayjs.Dayjs` for every day in the month NOT present in
 *   the input set, sorted ascending. Empty array if every day in the month is
 *   in the input set.
 * @example
 * // Busy → Free
 * calculateComplementDaysInMonth(
 *   dayjs('2026-02-01').startOf('month'),
 *   ['2026-02-01T00:00:00.000Z', '2026-02-03T00:00:00.000Z'],
 * );
 * // → Dayjs[] representing [Feb 2, Feb 4, Feb 5, ..., Feb 28]
 *
 * // Free → Busy: pass the free-day list, get the busy days back.
 */
export function calculateComplementDaysInMonth(
  dayJsMonth: dayjs.Dayjs,
  inputDayIsoStrings: string[],
): dayjs.Dayjs[] {
  // ─── Step 1: Build a Set of input day-of-month numbers ────────────────
  // Use Set<number> instead of Array for O(1) membership checks in Step 2.
  const inputDayNumberSet = new Set(inputDayIsoStrings.map((s) => dayjs(s).date()));

  // ─── Step 2: Walk every day of the month, keep the ones not in the input ─
  // `dayJsMonth.daysInMonth()` returns the correct day count in month (28/29/30/31)
  // also accounts for leap years, so callers never need to special-case February.
  // dayjs is immutable so this does not mutate `dayJsMonth`.
  const dayCountInMonth = dayJsMonth.daysInMonth();
  const complementDays: dayjs.Dayjs[] = [];
  for (let day = 1; day <= dayCountInMonth; day++) {
    if (!inputDayNumberSet.has(day)) complementDays.push(dayJsMonth.date(day));
  }

  return complementDays;
}
