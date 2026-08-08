/**
 * Build a Prisma `where` fragment 
 * that matches records whose `[startDate, endDate]` **overlaps** the given filter range.
 *
 * Two ranges overlap when neither ends before the other begins:
 * ```
 *   record.startDate ≤ filter.endDate   — record did not finish before the filter opens
 *   record.endDate   ≥ filter.startDate — record did not start after the filter closes
 * ```
 *
 * @param filter - Object with optional ISO-string `startDate` and `endDate` boundaries.
 * @returns Prisma where fragment `{ startDate: { lte }, endDate: { gte } }`,
 *          or `{}` when either boundary is missing.
 * @example
 * // Filter Tours that run during June 2026
 * generateDateOverlapClause({ startDate: '2026-06-01', endDate: '2026-06-30' });
 * // { startDate: { lte: Date('2026-06-30') }, endDate: { gte: Date('2026-06-01') } }
 *
 * // No filter → no-op
 * generateDateOverlapClause(undefined); // {}
 */
export function generateDateOverlapClause(filter?: {
  startDate?: string;
  endDate?: string;
}) {
  // ─── return a no-op clause when either boundary is absent
  // Spreading {} into a Prisma where object is harmless, 
  // so callers never need to null-check the return value.
  if (!filter?.startDate || !filter?.endDate) return {};

  // ─── Build the overlap condition
  // Translating to filter's [startDate, endDate] vs record's [startDate, endDate]:
  return {
    startDate: { lte: new Date(filter.endDate) },  // record starts before filter closes
    endDate: { gte: new Date(filter.startDate) },  // record ends after filter opens
  };
}
