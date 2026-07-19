/**
 * A raw busy date-range.
 *
 * `startDate`/`endDate` are ISO instant strings.
 */
export interface BusyDateRange {
  startDate: string;
  endDate: string;
}

export type BusyDaysByMonth = Record<string, string[]>;

export interface YearFilterParam {
  year: number;
}
