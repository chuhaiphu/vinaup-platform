import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static';
import { Text, View } from 'react-native';

import { GoogleMapsLinkButton } from '@/components/commons/buttons/google-maps-link-button';
import {
  ATTENDANCE_MODE,
  ATTENDANCE_RECORD_STATUS,
  AttendanceModeDisplay,
} from '@/constants/attendance-constants';
import { COLORS, ICON_SIZES } from '@/constants/style-constants';
import { AttendanceRecordResponse } from '@/interfaces/attendance-interfaces';
import { calculateDurationInMinutes } from '@/utils/calculator/calculate-duration-in-minutes';
import { generateDurationText } from '@/utils/generator/string-generator/generate-duration-text';
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
  const { mode, status, checkInAt, checkOutAt, location, note, latitude, longitude } =
    attendanceRecord;

  const isOpen = status === ATTENDANCE_RECORD_STATUS.OPEN;
  const isCheckInOnly = mode === ATTENDANCE_MODE.CHECK_IN;
  const checkOutInstant = checkOutAt ? new Date(checkOutAt) : null;
  const checkInTime = generateZonedTime(new Date(checkInAt), organizationTimezone);
  const checkOutTime = checkOutInstant
    ? generateZonedTime(checkOutInstant, organizationTimezone)
    : EMPTY_TIME_PLACEHOLDER;

  // A lone check-in is a single instant, so it has no closing time and nothing to total up.
  const timeText = isCheckInOnly ? checkInTime : `${checkInTime} - ${checkOutTime}`;

  const durationEndInstant = isOpen ? now : checkOutInstant;
  const duration = durationEndInstant
    ? generateDurationText(calculateDurationInMinutes(new Date(checkInAt), durationEndInstant))
    : EMPTY_TIME_PLACEHOLDER;

  const showDetail = Boolean(location) || Boolean(note);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.content,
          isCheckInOnly && styles.contentCheckIn,
          isOpen && styles.contentOpen,
        ]}
      >
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.titleText,
              isCheckInOnly && styles.titleCheckInText,
              isOpen && styles.titleOpenText,
            ]}
          >
            {AttendanceModeDisplay[mode]}
          </Text>
          {!isCheckInOnly && <Text style={styles.totalLabelText}>Tổng</Text>}
        </View>

        <View style={styles.timeRow}>
          <View style={styles.timeContainer}>
            <FontAwesome5 name="clock" size={ICON_SIZES.sm} color={COLORS.gray500} />
            <Text style={styles.timeText}>{timeText}</Text>
          </View>
          {!isCheckInOnly && <Text style={styles.durationText}>{duration}</Text>}
        </View>

        {showDetail && (
          <View style={styles.detailContainer}>
            {!!location && (
              <View style={styles.detailRow}>
                <GoogleMapsLinkButton
                  latitude={latitude}
                  longitude={longitude}
                  size={ICON_SIZES.lg}
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
