import { PERMISSION_ACTION, PERMISSION_RESOURCE } from '@vinaup-platform/permission';
import { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import VinaupLocation from '@/components/icons/vinaup-location.native';
import { AttendancePunchConfirmModal } from '@/components/organization/attendance/modals/attendance-punch-confirm-modal/attendance-punch-confirm-modal';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { ATTENDANCE_PUNCH_ACTION } from '@/constants/attendance-constants';
import {
  AVATAR_SIZES,
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  ICON_SIZES,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';
import { useOrganizationAttendancePunchContext } from '@/providers/organization/attendance/organization-attendance-punch-provider';
import { useOrganizationAbility } from '@/providers/organization/organization-ability-provider';

interface AttendancePunchBarProps {
  organizationId: string;
}

export function AttendancePunchBar({ organizationId }: AttendancePunchBarProps) {
  const { can } = useOrganizationAbility();
  const {
    attendanceMode,
    openAttendanceRecord,
    isMutatingAttendanceRecord,
    handleCreateAttendanceRecord,
    handleCheckOutAttendanceRecord,
  } = useOrganizationAttendancePunchContext();
  const modalRef = useRef<SlideSheetRef | null>(null);

  if (!can(PERMISSION_ACTION.CREATE, PERMISSION_RESOURCE.ATTENDANCE_RECORD)) return null;

  // A session left open is the one thing a punch can do next; anything else opens a new one.
  const punchAction = openAttendanceRecord
    ? ATTENDANCE_PUNCH_ACTION.CHECK_OUT
    : ATTENDANCE_PUNCH_ACTION.CHECK_IN;
  const isCheckingIn = punchAction === ATTENDANCE_PUNCH_ACTION.CHECK_IN;

  return (
    <View style={styles.punchContainer}>
      <View style={[styles.punchLabelContainer, styles.punchLabelLeftContainer]}>
        <Text style={[styles.punchHintText, !isCheckingIn && styles.punchDisabledText]}>Bấm</Text>
        <Text style={[styles.punchActionText, !isCheckingIn && styles.punchDisabledText]}>
          Check in
        </Text>
      </View>
      <PressableOpacity
        style={[styles.punchButton, !isCheckingIn && styles.punchCheckOutButton]}
        onPress={() => modalRef.current?.open()}
      >
        <VinaupLocation
          width={ICON_SIZES.xxl}
          height={ICON_SIZES.xxl}
          color={isCheckingIn ? COLORS.yellow400 : COLORS.teal700}
        />
      </PressableOpacity>
      <View style={[styles.punchLabelContainer, styles.punchLabelRightContainer]}>
        <Text style={[styles.punchHintText, isCheckingIn && styles.punchDisabledText]}>Bấm</Text>
        <Text style={[styles.punchActionText, isCheckingIn && styles.punchDisabledText]}>
          Check out
        </Text>
      </View>
      <AttendancePunchConfirmModal
        modalRef={modalRef}
        organizationId={organizationId}
        punchAction={punchAction}
        attendanceMode={attendanceMode}
        isLoading={isMutatingAttendanceRecord}
        onConfirm={(value, closeModal) => {
          if (value.punchAction === ATTENDANCE_PUNCH_ACTION.CHECK_IN) {
            handleCreateAttendanceRecord(value.request, closeModal);
            return;
          }
          handleCheckOutAttendanceRecord(value.request, closeModal);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  punchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
    marginVertical: SPACING.sm,
  },
  punchButton: {
    width: AVATAR_SIZES.lg,
    height: AVATAR_SIZES.lg,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.teal700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  punchCheckOutButton: {
    backgroundColor: COLORS.yellow400,
  },
  punchLabelContainer: {
    flex: 1,
  },
  punchLabelLeftContainer: {
    alignItems: 'flex-end',
    paddingRight: SPACING.md,
  },
  punchLabelRightContainer: {
    alignItems: 'flex-start',
    paddingLeft: SPACING.md,
  },
  punchHintText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal900,
  },
  punchActionText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal900,
  },
  punchDisabledText: {
    color: COLORS.gray400,
  },
});
