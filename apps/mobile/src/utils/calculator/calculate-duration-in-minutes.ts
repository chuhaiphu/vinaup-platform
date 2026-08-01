const MS_IN_MINUTE = 60_000;

/**
 * The whole minutes between two instants.
 *
 * @param startInstant - Where the span opens.
 * @param endInstant - Where the span closes.
 * @returns Whole minutes. An inverted or unparsable span clamps to `0`.
 */
export function calculateDurationInMinutes(startInstant: Date, endInstant: Date): number {
  const startMs = startInstant.getTime();
  const endMs = endInstant.getTime();
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return 0;

  return Math.max(0, Math.floor((endMs - startMs) / MS_IN_MINUTE));
}
