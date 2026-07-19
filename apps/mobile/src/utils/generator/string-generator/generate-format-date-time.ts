import dayjs from 'dayjs';

/**
 * Formats a date/time value into a display string using the given pattern.
 * Returns '-' if the value is null or cannot be parsed as a valid date.
 *
 * @param value - Date/time value to format (ISO string, Date, or null).
 * @param format - dayjs pattern. Defaults to 'DD/MM HH:mm'.
 * @returns Formatted string, e.g. "30/04 14:35", or '-' if null or invalid.
 * @example
 * generateFormatDateTime('2026-04-30T14:35:00.000Z'); // "30/04 14:35"
 * generateFormatDateTime(null);                       // "-"
 * generateFormatDateTime('2026-04-30', 'DD/MM/YYYY'); // "30/04/2026"
 */
export function generateFormatDateTime(
  value: string | Date | null,
  format = 'DD/MM HH:mm',
): string {
  if (!value) return '-';
  const formatted = dayjs(value);
  if (!formatted.isValid()) return '-';
  return formatted.format(format);
}
