/**
 * Derive the calendar date from a Date instant read through a fixed IANA timezone.
 *
 * The instant is a precise moment.
 * 
 * The timezone is the lens that decides which wall-calendar day it falls on.
 * 
 * Returns the bare `YYYY-MM-DD` label stored and shipped verbatim (Calendar-Date Pattern).
 *
 * @example
 * generateCalendarDate(new Date('2026-04-30T17:30:00Z'), 'Asia/Ho_Chi_Minh');
 * // → "2026-05-01"
 */
export function generateCalendarDate(instant: Date, timeZone: string): string {
  // The locale is PINNED on purpose. If left empty, Intl uses the server's default locale,
  // the output shape would vary by host (en-US → "5/1/2026", vi-VN → "01/05/2026"). 
  // `en-CA` is the conventional locale whose date format is `YYYY-MM-DD` (sv-SE also works),
  // giving one deterministic ISO layout on every machine.
  return new Intl.DateTimeFormat('en-CA', { timeZone }).format(instant);
}
