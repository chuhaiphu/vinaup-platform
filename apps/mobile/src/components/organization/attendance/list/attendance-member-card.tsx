import { StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/primitives/badge';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import {
  ATTENDANCE_CONCLUSION_UNSET_LABEL,
  ATTENDANCE_CONCLUSION_UNSET_VARIANT,
  ATTENDANCE_RECORD_STATUS,
  AttendanceConclusionStatusDisplay,
  AttendanceConclusionStatusVariant,
} from '@/constants/attendance-constants';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/style-constants';
import {
  AttendanceConclusionResponse,
  AttendanceRecordResponse,
} from '@/interfaces/attendance-interfaces';
import { OrganizationMemberResponse } from '@/interfaces/organization-member-interfaces';
import { calculateAttendanceTotalMinutes } from '@/utils/calculator/calculate-attendance-total-minutes';
import { generateAttendanceConclusionSummary } from '@/utils/generator/string-generator/generate-attendance-conclusion-summary';
import { generateDurationText } from '@/utils/generator/string-generator/generate-duration-text';

interface AttendanceMemberCardProps {
  organizationMember: OrganizationMemberResponse;
  attendanceRecords: AttendanceRecordResponse[];
  attendanceConclusion: AttendanceConclusionResponse | null;
  /** "Now", supplied by the list so one timer drives every still-open total. */
  now: Date;
  onPress: () => void;
}

export function AttendanceMemberCard({
  organizationMember,
  attendanceRecords,
  attendanceConclusion,
  now,
  onPress,
}: AttendanceMemberCardProps) {
  const totalText = attendanceConclusion
    ? generateAttendanceConclusionSummary(attendanceConclusion)
    : generateDurationText(calculateAttendanceTotalMinutes(attendanceRecords, now));

  const statusLabel = attendanceConclusion
    ? AttendanceConclusionStatusDisplay[attendanceConclusion.status]
    : ATTENDANCE_CONCLUSION_UNSET_LABEL;
  const statusVariant = attendanceConclusion
    ? AttendanceConclusionStatusVariant[attendanceConclusion.status]
    : ATTENDANCE_CONCLUSION_UNSET_VARIANT;

  const hasOpenAttendanceRecord = attendanceRecords.some(
    (attendanceRecord) => attendanceRecord.status === ATTENDANCE_RECORD_STATUS.OPEN,
  );
  const punchCountText = `${attendanceRecords.length} lượt`;

  return (
    <View style={styles.container}>
      <PressableOpacity style={styles.content} onPress={onPress}>
        <View style={styles.row}>
          <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
            {organizationMember.name}
          </Text>
          <Text style={styles.totalText}>{totalText}</Text>
        </View>
        <View style={styles.row}>
          <Badge variant={statusVariant}>{statusLabel}</Badge>
          <Text style={styles.punchText}>
            {punchCountText}
            {hasOpenAttendanceRecord && <Text style={styles.openText}> - đang mở</Text>}
          </Text>
        </View>
      </PressableOpacity>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.sm,
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
  punchText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
  },
  openText: {
    color: COLORS.yellow700,
  },
});
