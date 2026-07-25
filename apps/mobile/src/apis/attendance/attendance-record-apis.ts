import { wireApi } from 'fetchwire';

import { AttendanceRecordFilterParam } from '@/interfaces/_query-param-interfaces';
import {
  AttendanceRecordResponse,
  CheckOutAttendanceRecordRequest,
  CreateAttendanceRecordRequest,
  UpdateAttendanceRecordRequest,
} from '@/interfaces/attendance-interfaces';
import { generateFilterQueryString } from '@/utils/generator/string-generator/generate-filter-query-string';

export async function createAttendanceRecord(data: CreateAttendanceRecordRequest) {
  return wireApi<AttendanceRecordResponse>('/attendance-record', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function checkOutAttendanceRecord(data: CheckOutAttendanceRecordRequest) {
  return wireApi<AttendanceRecordResponse>('/attendance-record/check-out', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getMyAttendanceRecords(filter?: AttendanceRecordFilterParam) {
  // The attendance filter is workDate-keyed, not the startDate/endDate shape
  // generateFilterQueryString handles natively — so every key goes through additionalParams.
  const filterQueryString = generateFilterQueryString(undefined, {
    organizationId: filter?.organizationId,
    status: filter?.status,
    workDateFrom: filter?.workDateFrom,
    workDateTo: filter?.workDateTo,
  });
  return wireApi<AttendanceRecordResponse[]>(`/attendance-record${filterQueryString}`, {
    method: 'GET',
  });
}

export async function updateAttendanceRecord(id: string, data: UpdateAttendanceRecordRequest) {
  return wireApi<AttendanceRecordResponse>(`/attendance-record/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteAttendanceRecord(id: string) {
  return wireApi<void>(`/attendance-record/${id}`, {
    method: 'DELETE',
  });
}
