import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static';
import { PERMISSION_ACTION, PERMISSION_RESOURCE } from '@vinaup-platform/permission';
import { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AttendanceConclusionModal } from '@/components/organization/attendance/modals/attendance-conclusion-modal/attendance-conclusion-modal';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, ICON_SIZES, SPACING } from '@/constants/style-constants';
import { useCurrentMinute } from '@/hooks/use-current-minute';
import { useAttendanceRecordListInOrganizationContext } from '@/providers/organization/attendance/attendance-record-list-in-organization-provider';
import { useOrganizationAttendanceConclusionListContext } from '@/providers/organization/attendance/organization-attendance-conclusion-list-provider';
import { useOrganizationAbility } from '@/providers/organization/organization-ability-provider';
import { calculateAttendanceTotalMinutes } from '@/utils/calculator/calculate-attendance-total-minutes';
import { generateAttendanceConclusionSummary } from '@/utils/generator/string-generator/generate-attendance-conclusion-summary';
import { generateDurationText } from '@/utils/generator/string-generator/generate-duration-text';

interface AttendanceConclusionBarProps {
  organizationId: string;
  organizationMemberId: string;
  workDate: string;
}

export function AttendanceConclusionBar({
  organizationId,
  organizationMemberId,
  workDate,
}: AttendanceConclusionBarProps) {
  const insets = useSafeAreaInsets();
  const { can } = useOrganizationAbility();
  const modalRef = useRef<SlideSheetRef | null>(null);

  const { attendanceRecords } = useAttendanceRecordListInOrganizationContext();
  const {
    attendanceConclusions,
    isMutatingAttendanceConclusion,
    handleCreateAttendanceConclusion,
    handleUpdateAttendanceConclusion,
  } = useOrganizationAttendanceConclusionListContext();

  const now = useCurrentMinute();

  const attendanceConclusion =
    attendanceConclusions.find(
      (conclusion) => conclusion.organizationMemberId === organizationMemberId,
    ) ?? null;

  const memberAttendanceRecords = attendanceRecords.filter(
    (attendanceRecord) => attendanceRecord.organizationMemberId === organizationMemberId,
  );
  const totalText = attendanceConclusion
    ? generateAttendanceConclusionSummary(attendanceConclusion)
    : generateDurationText(calculateAttendanceTotalMinutes(memberAttendanceRecords, now));

  // A member with no punch at all still needs the bar — that is the leave-day case.
  if (!can(PERMISSION_ACTION.CREATE, PERMISSION_RESOURCE.ATTENDANCE_CONCLUSION)) return null;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <PressableOpacity style={styles.barRow} onPress={() => modalRef.current?.open()}>
        <View style={styles.leftContainer}>
          <FontAwesome5
            iconStyle="solid"
            name="clipboard-check"
            size={ICON_SIZES.md}
            color={COLORS.teal700}
          />
          <Text style={styles.titleText}>Kết luận</Text>
        </View>
        <Text style={styles.totalText}>{totalText}</Text>
      </PressableOpacity>

      <AttendanceConclusionModal
        modalRef={modalRef}
        attendanceConclusion={attendanceConclusion}
        isLoading={isMutatingAttendanceConclusion}
        onConfirm={(value, closeModal) => {
          // The form only ever edits the metrics; the identity of the workday is the bar's to add,
          // and it is what decides whether this is the first verdict or a revision of one.
          if (attendanceConclusion) {
            handleUpdateAttendanceConclusion(attendanceConclusion.id, value, closeModal);
            return;
          }
          handleCreateAttendanceConclusion(
            { organizationId, organizationMemberId, workDate, ...value },
            closeModal,
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.green50,
    borderTopWidth: 1.5,
    borderTopColor: COLORS.teal700,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  titleText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal900,
  },
  totalText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal900,
  },
});
