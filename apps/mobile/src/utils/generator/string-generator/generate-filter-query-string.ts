import { DateFilterParam } from '@/interfaces/_query-param-interfaces';

function generateDateFilterParams(
  filter?: DateFilterParam,
  params: URLSearchParams = new URLSearchParams(),
): URLSearchParams {
  if (filter) {
    if (filter.startDate) params.append('startDate', filter.startDate);
    if (filter.endDate) params.append('endDate', filter.endDate);
  }
  return params;
}

/**
 * Builds a query string from a date filter and optional additional params.
 * Returns an empty string when no params are present.
 *
 * @param filter - Optional date filter with startDate / endDate.
 * @param additionalParams - Map of extra params. Undefined values are omitted.
 * @returns Query string starting with '?', or '' if there are no params.
 * @example
 * generateFilterQueryString({ startDate: '2026-03-31T17:00:00.000Z', endDate: '...' });
 * // → "?startDate=2026-03-31T17%3A00%3A00.000Z&endDate=..."
 *
 * generateFilterQueryString(filter, { status: 'ACTIVE' });
 * // → "?startDate=...&endDate=...&status=ACTIVE"
 *
 * generateFilterQueryString(); // → ""
 */
export function generateFilterQueryString(
  filter?: DateFilterParam,
  additionalParams?: Record<string, string | undefined>,
): string {
  const params = generateDateFilterParams(filter);

  if (additionalParams) {
    Object.entries(additionalParams).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
  }

  const query = params.toString();
  return query ? `?${query}` : '';
}
