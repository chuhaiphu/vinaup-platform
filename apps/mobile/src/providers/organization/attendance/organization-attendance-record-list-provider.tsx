import { useFetch } from 'fetchwire';
import { createContext, useContext } from 'react';

import { getMyAttendanceRecords } from '@/apis/attendance/attendance-record-apis';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { AttendanceRecordResponse } from '@/interfaces/attendance-interfaces';

interface OrganizationAttendanceRecordListContextType {
  attendanceRecords: AttendanceRecordResponse[];
  isRefreshing: boolean;
  refreshFetch: () => void;
}

const OrganizationAttendanceRecordListContext =
  createContext<OrganizationAttendanceRecordListContextType | null>(null);

export function useOrganizationAttendanceRecordListContext() {
  const ctx = useContext(OrganizationAttendanceRecordListContext);
  if (!ctx)
    throw new Error(
      'useOrganizationAttendanceRecordListContext must be used within OrganizationAttendanceRecordListProvider',
    );
  return ctx;
}

export function OrganizationAttendanceRecordListProvider({
  organizationId,
  workDate,
  children,
}: {
  organizationId: string;
  workDate: string;
  children: React.ReactNode;
}) {
  // One bare YYYY-MM-DD on both bounds — the filter schema rejects a half-open range.
  const { data, refreshFetch, isRefreshing } = useFetch(
    () => getMyAttendanceRecords({ organizationId, workDateFrom: workDate, workDateTo: workDate }),
    {
      fetchKey: `organization-attendance-record-list-${organizationId}-${workDate}`,
      tags: [FETCH_TAG.attendanceRecordList],
    },
  );

  return (
    <OrganizationAttendanceRecordListContext
      value={{
        attendanceRecords: data ?? [],
        isRefreshing,
        refreshFetch,
      }}
    >
      {children}
    </OrganizationAttendanceRecordListContext>
  );
}
