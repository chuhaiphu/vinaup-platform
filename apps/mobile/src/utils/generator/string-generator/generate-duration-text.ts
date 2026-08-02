const MINUTES_IN_HOUR = 60;

export type DurationTextFormat = 'minute' | 'hour-minute';

/**
 * Renders a span, already reduced to whole minutes, in the requested format.
 *
 * @param minutes - The span in minutes. A negative or unparsable value clamps to zero.
 * @param format - `'minute'` → `201p`. `'hour-minute'` → `3h21p`, keeping a zero part visible
 *   (`0h45p`, `3h00p`).
 * @returns The formatted span.
 */
export function generateDurationText(
  minutes: number,
  format: DurationTextFormat = 'hour-minute',
): string {
  const wholeMinutes = Number.isFinite(minutes) && minutes > 0 ? Math.floor(minutes) : 0;

  if (format === 'minute') return `${wholeMinutes}p`;

  const hours = Math.floor(wholeMinutes / MINUTES_IN_HOUR);
  const remainingMinutes = wholeMinutes % MINUTES_IN_HOUR;

  return `${hours}h${String(remainingMinutes).padStart(2, '0')}p`;
}
