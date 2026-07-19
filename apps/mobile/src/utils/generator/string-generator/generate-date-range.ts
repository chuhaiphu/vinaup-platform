import dayjs from 'dayjs';

import { DD_MM_DATE_FORMAT_SHORT } from '@/constants/app-constants';

/**
 * Formats a date range into a compact display string. If start and end format to
 * identical strings under the given pattern, returns a single value instead of a range.
 *
 * @param start - ISO date/time string for the start.
 * @param end - ISO date/time string for the end.
 * @param format - dayjs pattern. Defaults to DD_MM_DATE_FORMAT_SHORT ('DD/MM').
 * @returns A string such as "10/04" or "10/04 - 13/04".
 * @example
 * generateDateRange('2026-04-10', '2026-04-10'); // "10/04"
 * generateDateRange('2026-04-10', '2026-04-13'); // "10/04 - 13/04"
 * generateDateRange('2026-04-10T09:00Z', '2026-04-10T17:00Z'); // "10/04" (same day under default format)
 */
export function generateDateRange(
  start: string,
  end: string,
  format = DD_MM_DATE_FORMAT_SHORT,
): string {
  const s = dayjs(start).format(format);
  const e = dayjs(end).format(format);
  return s === e ? s : `${s} - ${e}`;
}
