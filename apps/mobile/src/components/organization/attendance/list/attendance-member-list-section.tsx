import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { AttendanceMemberCard } from '@/components/organization/attendance/list/attendance-member-card';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/style-constants';
import { useCurrentMinute } from '@/hooks/use-current-minute';
import { useAttendanceRecordListInOrganizationContext } from '@/providers/organization/attendance/attendance-record-list-in-organization-provider';
import { useOrganizationAttendanceConclusionListContext } from '@/providers/organization/attendance/organization-attendance-conclusion-list-provider';
import { useOrganizationMemberListContext } from '@/providers/organization/member/organization-member-list-provider';

interface AttendanceMemberListSectionProps {
  organizationId: string;
  workDate: string;
}

export function AttendanceMemberListSection({
  organizationId,
  workDate,
}: AttendanceMemberListSectionProps) {
  const router = useRouter();

  const {
    organizationMembers,
    fetchMembers,
    isLoading: isLoadingMembers,
  } = useOrganizationMemberListContext();
  const {
    attendanceRecords,
    isRefreshing: isRefreshingAttendanceRecords,
    refreshFetch: refreshAttendanceRecords,
  } = useAttendanceRecordListInOrganizationContext();
  const {
    attendanceConclusions,
    isRefreshing: isRefreshingAttendanceConclusions,
    refreshFetch: refreshAttendanceConclusions,
  } = useOrganizationAttendanceConclusionListContext();

  useEffect(() => {
    if (!organizationMembers) fetchMembers();
  }, [organizationMembers, fetchMembers]);

  // One timer here drives every card's running total.
  const now = useCurrentMinute();

  const attendanceDayRowList = (organizationMembers ?? []).map((organizationMember) => ({
    organizationMember,
    attendanceRecords: attendanceRecords.filter(
      (attendanceRecord) => attendanceRecord.organizationMemberId === organizationMember.id,
    ),
    attendanceConclusion:
      attendanceConclusions.find(
        (attendanceConclusion) =>
          attendanceConclusion.organizationMemberId === organizationMember.id,
      ) ?? null,
  }));

  const handleRefresh = () => {
    fetchMembers();
    refreshAttendanceRecords();
    refreshAttendanceConclusions();
  };

  return (
    <View style={styles.listContainer}>
      <FlatList
        data={attendanceDayRowList}
        keyExtractor={(item) => item.organizationMember.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <AttendanceMemberCard
            organizationMember={item.organizationMember}
            attendanceRecords={item.attendanceRecords}
            attendanceConclusion={item.attendanceConclusion}
            now={now}
            onPress={() =>
              router.push({
                pathname: '/(protected)/attendance-management/[organizationMemberId]',
                params: {
                  organizationMemberId: item.organizationMember.id,
                  organizationMemberName: item.organizationMember.name,
                  organizationId,
                  workDate,
                },
              })
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Tổ chức chưa có thành viên nào</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={
              isLoadingMembers || isRefreshingAttendanceRecords || isRefreshingAttendanceConclusions
            }
            onRefresh={handleRefresh}
            colors={[COLORS.teal700]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: SPACING.lg,
  },
  separator: {
    height: SPACING.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
    fontStyle: 'italic',
  },
});
