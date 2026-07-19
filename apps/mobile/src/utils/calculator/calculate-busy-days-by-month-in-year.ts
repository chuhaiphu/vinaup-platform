import { BusyDateRange, BusyDaysByMonth } from '@/interfaces/calendar-interfaces';
import { generateDayJsDateChain } from '@/utils/generator/string-generator/generate-day-js-date-chain';

/**
 * Calculates a `{ "YYYY-MM": ["YYYY-MM-DD", ...] }` map of busy days for one year,
 * resolving each calendar day in the device's LOCAL timezone.
 *
 * @param busyDateRangeList - Raw `{ startDate, endDate }` ISO instants from the busy-days endpoint.
 * @param year - Calendar year being rendered; days resolving outside it are dropped.
 * @returns Map of `"YYYY-MM"` to a sorted, de-duplicated array of `"YYYY-MM-DD"` local day keys.
 * @example
 * calculateBusyDaysByMonthInYear(
 *   [{ startDate: '2026-04-30T01:00:00Z', endDate: '2026-05-02T11:00:00Z' }], // UTC+7 viewer
 *   2026,
 * );
 * // { "2026-04": ["2026-04-30"], "2026-05": ["2026-05-01", "2026-05-02"] }
 */
export function calculateBusyDaysByMonthInYear(
  busyDateRangeList: BusyDateRange[],
  year: number,
): BusyDaysByMonth {
  // ─── Step 1: Accumulate busy days into Map<"YYYY-MM", Set<"YYYY-MM-DD">> ───
  // WHY a Set per month: ranges can overlap on the same calendar day,
  // the Set collapses duplicates so each day is counted once without extra checks.
  const busyDaySetByMonthMap = new Map<string, Set<string>>();

  for (const busyDateRange of busyDateRangeList) {
    // generateDayJsDateChain yields one Dayjs per day in [start, end] in LOCAL time,
    // so the day boundaries match what the user sees on their device.
    for (const dayJs of generateDayJsDateChain(busyDateRange.startDate, busyDateRange.endDate)) {
      if (dayJs.year() !== year) continue;

      const monthKey = dayJs.format('YYYY-MM'); // e.g. "2026-04"
      const busyDaySet = busyDaySetByMonthMap.get(monthKey) ?? new Set<string>();
      busyDaySet.add(dayJs.format('YYYY-MM-DD')); // e.g. "2026-04-30"
      busyDaySetByMonthMap.set(monthKey, busyDaySet);
    }
  }

  // ─── Step 2: Materialize each Set into a sorted array (the shape the calendar consumes) ───
  const busyDaysByMonth: BusyDaysByMonth = {};
  for (const [monthKey, busyDaySet] of busyDaySetByMonthMap) {
    // localeCompare gives a reliable sort of the "YYYY-MM-DD" strings instead of relying on default code-unit ordering.
    busyDaysByMonth[monthKey] = Array.from(busyDaySet).sort((a, b) => a.localeCompare(b));
  }
  return busyDaysByMonth;
}
