import { useFetch } from 'fetchwire';
import { createContext, useContext } from 'react';

import { getAttendanceRecordsByOrganizationId } from '@/apis/attendance/attendance-record-apis';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { AttendanceRecordResponse } from '@/interfaces/attendance-interfaces';

interface AttendanceRecordListInOrganizationContextType {
  attendanceRecords: AttendanceRecordResponse[];
  isRefreshing: boolean;
  refreshFetch: () => void;
}

const AttendanceRecordListInOrganizationContext =
  createContext<AttendanceRecordListInOrganizationContextType | null>(null);

export function useAttendanceRecordListInOrganizationContext() {
  const ctx = useContext(AttendanceRecordListInOrganizationContext);
  if (!ctx)
    throw new Error(
      'useAttendanceRecordListInOrganizationContext must be used within AttendanceRecordListInOrganizationProvider',
    );
  return ctx;
}

// Every member's punches for one workday — the manager's view.
export function AttendanceRecordListInOrganizationProvider({
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
    () =>
      getAttendanceRecordsByOrganizationId(organizationId, {
        workDateFrom: workDate,
        workDateTo: workDate,
      }),
    {
      fetchKey: `organization-attendance-record-list-in-organization-${organizationId}-${workDate}`,
      tags: [FETCH_TAG.attendanceRecordList],
    },
  );

  return (
    <AttendanceRecordListInOrganizationContext
      value={{
        attendanceRecords: data ?? [],
        isRefreshing,
        refreshFetch,
      }}
    >
      {children}
    </AttendanceRecordListInOrganizationContext>
  );
}
