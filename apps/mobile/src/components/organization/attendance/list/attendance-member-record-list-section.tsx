import { useAttendanceRecordListInOrganizationContext } from '@/providers/organization/attendance/attendance-record-list-in-organization-provider';

import { AttendanceRecordListSection } from './attendance-record-list-section';

interface AttendanceMemberRecordListSectionProps {
  organizationMemberId: string;
  organizationTimezone: string;
}

export function AttendanceMemberRecordListSection({
  organizationMemberId,
  organizationTimezone,
}: AttendanceMemberRecordListSectionProps) {
  const { attendanceRecords, isRefreshing, refreshFetch } =
    useAttendanceRecordListInOrganizationContext();

  const memberAttendanceRecords = attendanceRecords.filter(
    (attendanceRecord) => attendanceRecord.organizationMemberId === organizationMemberId,
  );

  return (
    <AttendanceRecordListSection
      attendanceRecords={memberAttendanceRecords}
      organizationTimezone={organizationTimezone}
      isRefreshing={isRefreshing}
      onRefresh={refreshFetch}
    />
  );
}
