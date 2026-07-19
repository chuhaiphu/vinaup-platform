/**
 * One busy date-range of a project/wage, as returned by the `busy-days` endpoints.
 *
 * The server returns only the raw instants — it does NOT decide which calendar days
 * are busy. "Which day" depends on the viewer's timezone, so the mobile client groups
 * these ranges into local days itself (see the `calculate-busy-days-by-month` util).
 */
export interface BusyDateRange {
  startDate: Date;
  endDate: Date;
}
