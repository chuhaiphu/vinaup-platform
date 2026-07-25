const MINUTES_IN_HOUR = 60;
const MS_IN_MINUTE = 60_000;

/**
 * Formats the worked span of one attendance record as `<hours>h<minutes>`.
 *
 * @param checkInAt - The record's `checkInAt` instant, as the ISO string the API ships.
 * @param endInstant - Where the span stops: `checkOutAt` when closed, "now" while still open.
 * @returns The span as `3h21`. A negative or unparsable span clamps to `0h00`, so a device
 *   clock running behind the server can never render a negative total.
 *
 * @example
 * calculateAttendanceDuration('2026-05-01T02:12:00.000Z', new Date('2026-05-01T05:33:00.000Z'));
 * // → "3h21"
 */
export function calculateAttendanceDuration(checkInAt: string, endInstant: Date): string {
  const checkInMs = new Date(checkInAt).getTime();
  const endMs = endInstant.getTime();
  if (Number.isNaN(checkInMs) || Number.isNaN(endMs)) return '0h00';

  const elapsedMinutes = Math.max(0, Math.floor((endMs - checkInMs) / MS_IN_MINUTE));
  const hours = Math.floor(elapsedMinutes / MINUTES_IN_HOUR);
  const minutes = elapsedMinutes % MINUTES_IN_HOUR;

  return `${hours}h${String(minutes).padStart(2, '0')}`;
}
