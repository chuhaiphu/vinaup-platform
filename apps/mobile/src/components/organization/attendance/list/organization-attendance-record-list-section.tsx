import { useOrganizationAttendanceRecordListContext } from '@/providers/organization/attendance/organization-attendance-record-list-provider';

import { AttendanceRecordListSection } from './attendance-record-list-section';

interface OrganizationAttendanceRecordListSectionProps {
  organizationTimezone: string;
}

export function OrganizationAttendanceRecordListSection({
  organizationTimezone,
}: OrganizationAttendanceRecordListSectionProps) {
  const { attendanceRecords, isRefreshing, refreshFetch } =
    useOrganizationAttendanceRecordListContext();

  return (
    <AttendanceRecordListSection
      attendanceRecords={attendanceRecords}
      organizationTimezone={organizationTimezone}
      isRefreshing={isRefreshing}
      onRefresh={refreshFetch}
    />
  );
}
