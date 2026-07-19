import { wireApi } from 'fetchwire';

import { ProjectFilterParam } from '@/interfaces/_query-param-interfaces';
import { BusyDateRange, BusyDaysByMonth, YearFilterParam } from '@/interfaces/calendar-interfaces';
import {
  CreateProjectRequest,
  ProjectResponse,
  UpdateProjectRequest,
} from '@/interfaces/project-interfaces';
import { calculateBusyDaysByMonthInYear } from '@/utils/calculator/calculate-busy-days-by-month-in-year';
import { generateFilterQueryString } from '@/utils/generator/string-generator/generate-filter-query-string';

export async function createProject(data: CreateProjectRequest) {
  return wireApi<ProjectResponse>('/project', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getProjectsOfCurrentUser(filter?: ProjectFilterParam) {
  const filterQueryString = generateFilterQueryString(filter, {
    type: filter?.type,
    status: filter?.status,
    categoryId: filter?.categoryId,
  });
  return wireApi<ProjectResponse[]>(`/project${filterQueryString}`, {
    method: 'GET',
  });
}

export async function getProjectsOfByOrganizationId(
  organizationId: string,
  filter?: ProjectFilterParam,
) {
  const filterQueryString = generateFilterQueryString(filter, {
    type: filter?.type,
    status: filter?.status,
    categoryId: filter?.categoryId,
  });
  return wireApi<ProjectResponse[]>(`/project/organization/${organizationId}${filterQueryString}`, {
    method: 'GET',
  });
}

export async function updateProject(id: string, data: UpdateProjectRequest) {
  return wireApi<ProjectResponse>(`/project/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteProject(id: string) {
  return wireApi<void>(`/project/${id}`, {
    method: 'DELETE',
  });
}

export async function getProjectBusyDays(filter: YearFilterParam): Promise<BusyDaysByMonth> {
  const response = await wireApi<BusyDateRange[]>(`/project/busy-days`, {
    method: 'GET',
  });
  return calculateBusyDaysByMonthInYear(response.data ?? [], filter.year);
}

export async function getProjectById(id: string) {
  return wireApi<ProjectResponse>(`/project/${id}`, {
    method: 'GET',
  });
}
