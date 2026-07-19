import { wireApi } from 'fetchwire';

import { WageFilterParam } from '@/interfaces/_query-param-interfaces';
import { BusyDateRange, BusyDaysByMonth, YearFilterParam } from '@/interfaces/calendar-interfaces';
import { CreateWageRequest, UpdateWageRequest, WageResponse } from '@/interfaces/wage-interfaces';
import { calculateBusyDaysByMonthInYear } from '@/utils/calculator/calculate-busy-days-by-month-in-year';
import { generateFilterQueryString } from '@/utils/generator/string-generator/generate-filter-query-string';

export async function createWage(data: CreateWageRequest) {
  return wireApi<WageResponse>('/wage', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getWagesOfCurrentUser(filter?: WageFilterParam) {
  const filterQueryString = generateFilterQueryString(filter, {
    status: filter?.status,
  });
  return wireApi<WageResponse[]>(`/wage${filterQueryString}`, {
    method: 'GET',
  });
}

export async function getWageBusyDays(filter: YearFilterParam): Promise<BusyDaysByMonth> {
  const response = await wireApi<BusyDateRange[]>(`/wage/busy-days`, {
    method: 'GET',
  });
  return calculateBusyDaysByMonthInYear(response.data ?? [], filter.year);
}

export async function getWageById(id: string) {
  return wireApi<WageResponse>(`/wage/${id}`, {
    method: 'GET',
  });
}

export async function updateWage(id: string, data: UpdateWageRequest) {
  return wireApi<WageResponse>(`/wage/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteWage(id: string) {
  return wireApi<void>(`/wage/${id}`, {
    method: 'DELETE',
  });
}
