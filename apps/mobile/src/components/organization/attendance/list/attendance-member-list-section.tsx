import { PERMISSION_ACTION, PERMISSION_RESOURCE } from '@vinaup-platform/permission';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { AttendanceMemberCard } from '@/components/organization/attendance/list/attendance-member-card';
import { AttendanceConclusionModal } from '@/components/organization/attendance/modals/attendance-conclusion-modal/attendance-conclusion-modal';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/style-constants';
import { useCurrentMinute } from '@/hooks/use-current-minute';
import {
  AttendanceConclusionResponse,
  AttendanceRecordResponse,
} from '@/interfaces/attendance-interfaces';
import { OrganizationMemberResponse } from '@/interfaces/organization-member-interfaces';
import { useAttendanceRecordListInOrganizationContext } from '@/providers/organization/attendance/attendance-record-list-in-organization-provider';
import { useOrganizationAttendanceConclusionListContext } from '@/providers/organization/attendance/organization-attendance-conclusion-list-provider';
import { useOrganizationMemberListContext } from '@/providers/organization/member/organization-member-list-provider';
import { useOrganizationAbility } from '@/providers/organization/organization-ability-provider';
import { generateAttendanceTotalText } from '@/utils/generator/string-generator/generate-attendance-total-text';

// One member's whole workday: who, what they punched, and the verdict standing over it.
interface AttendanceDayRow {
  organizationMember: OrganizationMemberResponse;
  attendanceRecords: AttendanceRecordResponse[];
  attendanceConclusion: AttendanceConclusionResponse | null;
  totalText: string;
}

interface AttendanceMemberListSectionProps {
  organizationId: string;
  workDate: string;
}

export function AttendanceMemberListSection({
  organizationId,
  workDate,
}: AttendanceMemberListSectionProps) {
  const router = useRouter();
  const { can } = useOrganizationAbility();
  const conclusionModalRef = useRef<SlideSheetRef | null>(null);
  const [selectedOrganizationMemberId, setSelectedOrganizationMemberId] = useState<string | null>(
    null,
  );

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
    isMutatingAttendanceConclusion,
    refreshFetch: refreshAttendanceConclusions,
    handleSubmitAttendanceConclusion,
  } = useOrganizationAttendanceConclusionListContext();

  useEffect(() => {
    if (!organizationMembers) fetchMembers();
  }, [organizationMembers, fetchMembers]);

  // One timer here drives every card's running total.
  const now = useCurrentMinute();

  const attendanceDayRowList: AttendanceDayRow[] = (organizationMembers ?? []).map(
    (organizationMember) => {
      const memberAttendanceRecords = attendanceRecords.filter(
        (attendanceRecord) => attendanceRecord.organizationMemberId === organizationMember.id,
      );
      const attendanceConclusion =
        attendanceConclusions.find(
          (conclusion) => conclusion.organizationMemberId === organizationMember.id,
        ) ?? null;

      return {
        organizationMember,
        attendanceRecords: memberAttendanceRecords,
        attendanceConclusion,
        totalText: generateAttendanceTotalText(memberAttendanceRecords, attendanceConclusion, now),
      };
    },
  );

  const canConcludeAttendance = can(
    PERMISSION_ACTION.CREATE,
    PERMISSION_RESOURCE.ATTENDANCE_CONCLUSION,
  );

  const selectedAttendanceMember =
    attendanceDayRowList.find(
      (attendanceDayRow) => attendanceDayRow.organizationMember.id === selectedOrganizationMemberId,
    ) ?? null;

  const handleConclusionPress = (organizationMemberId: string) => {
    setSelectedOrganizationMemberId(organizationMemberId);
    conclusionModalRef.current?.open();
  };

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
            totalText={item.totalText}
            canConcludeAttendance={canConcludeAttendance}
            onConclusionPress={() => handleConclusionPress(item.organizationMember.id)}
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

      <AttendanceConclusionModal
        modalRef={conclusionModalRef}
        organizationMemberName={selectedAttendanceMember?.organizationMember.name}
        attendanceConclusion={selectedAttendanceMember?.attendanceConclusion ?? null}
        totalText={selectedAttendanceMember?.totalText ?? ''}
        isLoading={isMutatingAttendanceConclusion}
        onConfirm={(value, closeModal) => {
          if (!selectedAttendanceMember) return;
          handleSubmitAttendanceConclusion(
            selectedAttendanceMember.organizationMember.id,
            value,
            closeModal,
          );
        }}
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
