import { wireData } from 'fetchwire';

import { AttendanceRecordFilterParam } from '@/interfaces/_query-param-interfaces';
import {
  AttendanceConclusionResponse,
  CreateAttendanceConclusionRequest,
  UpdateAttendanceConclusionRequest,
} from '@/interfaces/attendance-interfaces';
import { generateFilterQueryString } from '@/utils/generator/string-generator/generate-filter-query-string';

export async function createAttendanceConclusion(data: CreateAttendanceConclusionRequest) {
  return wireData<AttendanceConclusionResponse>('/attendance-conclusion', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getAttendanceConclusionsByOrganizationId(
  organizationId: string,
  filter?: AttendanceRecordFilterParam,
) {
  const filterQueryString = generateFilterQueryString(undefined, {
    workDateFrom: filter?.workDateFrom,
    workDateTo: filter?.workDateTo,
  });
  return wireData<AttendanceConclusionResponse[]>(
    `/attendance-conclusion/organization/${organizationId}${filterQueryString}`,
    { method: 'GET' },
  );
}

export async function updateAttendanceConclusion(
  id: string,
  data: UpdateAttendanceConclusionRequest,
) {
  return wireData<AttendanceConclusionResponse>(`/attendance-conclusion/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteAttendanceConclusion(id: string) {
  return wireData<void>(`/attendance-conclusion/${id}`, {
    method: 'DELETE',
  });
}
