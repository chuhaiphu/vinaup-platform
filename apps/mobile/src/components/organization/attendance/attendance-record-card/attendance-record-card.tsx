import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static';
import { Text, View } from 'react-native';

import { ATTENDANCE_RECORD_STATUS, AttendanceModeDisplay } from '@/constants/attendance-constants';
import { COLORS, ICON_SIZES } from '@/constants/style-constants';
import { AttendanceRecordResponse } from '@/interfaces/attendance-interfaces';
import { calculateAttendanceDuration } from '@/utils/calculator/calculate-attendance-duration';
import { generateZonedTime } from '@/utils/generator/string-generator/generate-zoned-time';

import { styles } from './attendance-record-card.styles';

const EMPTY_TIME_PLACEHOLDER = '—';

interface AttendanceRecordCardProps {
  attendanceRecord: AttendanceRecordResponse;
  organizationTimezone: string;
  /** "Now" in the org lens, supplied by the list so one timer drives every open card. */
  now: Date;
}

export function AttendanceRecordCard({
  attendanceRecord,
  organizationTimezone,
  now,
}: AttendanceRecordCardProps) {
  const { mode, status, checkInAt, checkOutAt, location, note } = attendanceRecord;

  const isOpen = status === ATTENDANCE_RECORD_STATUS.OPEN;
  const checkInTime = generateZonedTime(new Date(checkInAt), organizationTimezone);
  const checkOutTime = checkOutAt
    ? generateZonedTime(new Date(checkOutAt), organizationTimezone)
    : EMPTY_TIME_PLACEHOLDER;

  // An open session has no checkOutAt yet, so its total counts up to now instead.
  const duration = calculateAttendanceDuration(checkInAt, checkOutAt ? new Date(checkOutAt) : now);

  const showDetail = Boolean(location) || Boolean(note);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.titleText, !isOpen && styles.titleClosedText]}>
            {AttendanceModeDisplay[mode]}
          </Text>
          <Text style={styles.totalLabelText}>Tổng</Text>
        </View>

        <View style={styles.timeRow}>
          <View style={styles.timeContainer}>
            <FontAwesome5 name="clock" size={ICON_SIZES.sm} color={COLORS.gray500} />
            <Text style={styles.timeText}>
              {checkInTime} - {checkOutTime}
            </Text>
          </View>
          <Text style={styles.durationText}>{duration}</Text>
        </View>

        {showDetail && (
          <View style={styles.detailContainer}>
            {!!location && (
              <View style={styles.detailRow}>
                <FontAwesome5
                  name="map-marker-alt"
                  iconStyle="solid"
                  size={ICON_SIZES.sm}
                  color={COLORS.teal700}
                />
                <Text style={styles.detailText}>{location}</Text>
              </View>
            )}
            {!!note && (
              <View style={styles.detailRow}>
                <FontAwesome5 name="sticky-note" size={ICON_SIZES.sm} color={COLORS.teal700} />
                <Text style={styles.detailText}>{note}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
