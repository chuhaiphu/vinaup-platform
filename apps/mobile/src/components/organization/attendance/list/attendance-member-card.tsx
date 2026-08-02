import MaterialCommunityIcons, {
  type MaterialDesignIconsIconName,
} from '@react-native-vector-icons/material-design-icons/static';
import { StyleSheet, Text, View } from 'react-native';

import VinaupCheckIn from '@/components/icons/vinaup-check-in.native';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import {
  ATTENDANCE_CONCLUSION_UNSET_ICON,
  ATTENDANCE_CONCLUSION_UNSET_ICON_COLOR,
  ATTENDANCE_CONCLUSION_UNSET_LABEL,
  ATTENDANCE_RECORD_STATUS,
  AttendanceConclusionStatusDisplay,
  AttendanceConclusionStatusIcon,
  AttendanceConclusionStatusIconColor,
} from '@/constants/attendance-constants';
import {
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  ICON_SIZES,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';
import {
  AttendanceConclusionResponse,
  AttendanceRecordResponse,
} from '@/interfaces/attendance-interfaces';
import { OrganizationMemberResponse } from '@/interfaces/organization-member-interfaces';

interface AttendanceMemberCardProps {
  organizationMember: OrganizationMemberResponse;
  attendanceRecords: AttendanceRecordResponse[];
  attendanceConclusion: AttendanceConclusionResponse | null;
  /** The day's worked total, already resolved by the list against the conclusion. */
  totalText: string;
  canConcludeAttendance: boolean;
  onPress: () => void;
  onConclusionPress: () => void;
}

export function AttendanceMemberCard({
  organizationMember,
  attendanceRecords,
  attendanceConclusion,
  totalText,
  canConcludeAttendance,
  onPress,
  onConclusionPress,
}: AttendanceMemberCardProps) {
  const statusLabel = attendanceConclusion
    ? AttendanceConclusionStatusDisplay[attendanceConclusion.status]
    : ATTENDANCE_CONCLUSION_UNSET_LABEL;
  const statusIcon = attendanceConclusion
    ? AttendanceConclusionStatusIcon[attendanceConclusion.status]
    : ATTENDANCE_CONCLUSION_UNSET_ICON;
  const statusIconColor = attendanceConclusion
    ? AttendanceConclusionStatusIconColor[attendanceConclusion.status]
    : ATTENDANCE_CONCLUSION_UNSET_ICON_COLOR;

  const hasOpenAttendanceRecord = attendanceRecords.some(
    (attendanceRecord) => attendanceRecord.status === ATTENDANCE_RECORD_STATUS.OPEN,
  );

  // Both are penalties the manager counted, so a zero is nothing to report — the row stays away.
  const lateArrivalCount = attendanceConclusion?.lateArrivalCount ?? 0;
  const earlyDepartureCount = attendanceConclusion?.earlyDepartureCount ?? 0;
  const showContentBottom = lateArrivalCount > 0 || earlyDepartureCount > 0;

  const renderPenaltyRow = (icon: MaterialDesignIconsIconName, label: string, count: number) => (
    <View style={styles.bottomRow}>
      <View style={styles.bottomLeftColumn}>
        <MaterialCommunityIcons name={icon} size={ICON_SIZES.xs} color={COLORS.orange700} />
      </View>
      <View style={styles.bottomRightColumn}>
        <Text style={styles.bottomText}>{label}</Text>
        <Text style={styles.bottomText}>{count} lần</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <PressableOpacity
        style={[styles.content, showContentBottom && styles.contentAttached]}
        onPress={onPress}
      >
        <View style={styles.row}>
          <View style={styles.nameContainer}>
            <VinaupCheckIn width={ICON_SIZES.md} height={ICON_SIZES.md} color={COLORS.yellow400} />
            <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
              {organizationMember.name}
            </Text>
          </View>
          <Text style={styles.totalText}>{totalText}</Text>
        </View>
        <View style={styles.row}>
          <PressableOpacity
            style={styles.statusContainer}
            onPress={onConclusionPress}
            disabled={!canConcludeAttendance}
            hitSlop={8}
          >
            <MaterialCommunityIcons
              name={statusIcon}
              size={ICON_SIZES.md}
              color={statusIconColor}
            />
            <Text style={styles.statusText}>{statusLabel}</Text>
          </PressableOpacity>
          {hasOpenAttendanceRecord && <Text style={styles.openText}>Chưa checkout</Text>}
        </View>
      </PressableOpacity>

      {showContentBottom && (
        <View style={styles.contentBottom}>
          {lateArrivalCount > 0 &&
            renderPenaltyRow('clock-alert-outline', 'Đi trễ', lateArrivalCount)}
          {earlyDepartureCount > 0 && renderPenaltyRow('exit-run', 'Về sớm', earlyDepartureCount)}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.sm,
  },
  content: {
    gap: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 0.5,
    padding: SPACING.sm,
  },
  contentAttached: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  contentBottom: {
    gap: SPACING.xs,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomLeftRadius: RADIUS.md,
    borderBottomRightRadius: RADIUS.md,
    borderWidth: 0.5,
    borderTopWidth: 0,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  bottomLeftColumn: {
    width: 48,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  bottomRightColumn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  bottomText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  nameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  nameText: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal700,
  },
  totalText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal900,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
  },
  openText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.yellow700,
  },
});
