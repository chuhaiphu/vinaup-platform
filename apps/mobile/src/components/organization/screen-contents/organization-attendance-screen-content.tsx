import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static';
import { ATTENDANCE_MODE, type AttendanceMode } from '@vinaup-platform/validation';
import dayjs from 'dayjs';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import VinaupLeftRightArrows from '@/components/icons/vinaup-left-right-arrows.native';
import VinaupLocation from '@/components/icons/vinaup-location.native';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { TextToggler } from '@/components/primitives/text-toggler';
import { UnifiedDatePicker } from '@/components/primitives/unified-date-picker';
import { DD_MM_YYYY_DATE_FORMAT, YYYY_MM_DD_DATE_FORMAT } from '@/constants/app-constants';
import { DEFAULT_ORGANIZATION_TIMEZONE } from '@/constants/organization-constants';
import {
  AVATAR_SIZES,
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  ICON_SIZES,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';
import { useCurrentMinute } from '@/hooks/use-current-minute';
import { useOrganizationContext } from '@/providers/auth/organization-provider';
import { generateCalendarDate } from '@/utils/generator/string-generator/generate-calendar-date';
import { generateZonedTime } from '@/utils/generator/string-generator/generate-zoned-time';

export function OrganizationAttendanceScreenContent() {
  const router = useRouter();
  const { organizationId, workDate } = useLocalSearchParams<{
    organizationId: string;
    workDate?: string;
  }>();
  const { organizations } = useOrganizationContext();

  const [pickerVisible, setPickerVisible] = useState(false);
  const [attendanceMode, setAttendanceMode] = useState<AttendanceMode>(ATTENDANCE_MODE.CHECK_IN);

  const organizationTimezone =
    organizations.find((organization) => organization.id === organizationId)?.timezone ??
    DEFAULT_ORGANIZATION_TIMEZONE;

  const now = useCurrentMinute();
  const todayWorkDate = generateCalendarDate(now, organizationTimezone);
  const selectedWorkDate = workDate ?? todayWorkDate;
  const isLiveWorkDate = selectedWorkDate === todayWorkDate;

  const handleWorkDateChange = (date: dayjs.Dayjs) => {
    router.setParams({ workDate: date.format(YYYY_MM_DD_DATE_FORMAT) });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <View style={styles.leftContainer}>
          <PressableOpacity onPress={() => setPickerVisible(true)} style={styles.datePickerTrigger}>
            <FontAwesome5
              name="calendar-alt"
              size={ICON_SIZES.sm}
              color={COLORS.teal700}
              style={{ marginRight: SPACING.sm }}
            />
            <Text style={styles.dateText}>
              {dayjs(selectedWorkDate, YYYY_MM_DD_DATE_FORMAT).format(DD_MM_YYYY_DATE_FORMAT)}
            </Text>
          </PressableOpacity>
          {isLiveWorkDate && (
            <Text style={styles.clockText}>{generateZonedTime(now, organizationTimezone)}</Text>
          )}
        </View>
        {isLiveWorkDate && (
          <TextToggler
            textPair={['In', 'In-out']}
            currentIndex={attendanceMode === ATTENDANCE_MODE.CHECK_IN ? 0 : 1}
            onToggle={() =>
              setAttendanceMode((mode) =>
                mode === ATTENDANCE_MODE.CHECK_IN
                  ? ATTENDANCE_MODE.CHECK_IN_OUT
                  : ATTENDANCE_MODE.CHECK_IN,
              )
            }
            style={{ text: styles.togglerText }}
            iconPosition="right"
            iconPair={[
              <VinaupLeftRightArrows key="left-right-arrows" leftArrowColor={COLORS.gray300} />,
              <VinaupLeftRightArrows key="left-right-arrows-active" />,
            ]}
          />
        )}
      </View>
      {isLiveWorkDate && (
        <View style={styles.punchContainer}>
          <View style={[styles.punchLabelContainer, styles.punchLabelLeftContainer]}>
            <Text style={styles.punchHintText}>Bấm</Text>
            <Text style={styles.punchActionText}>Check in</Text>
          </View>
          <PressableOpacity style={styles.punchButton}>
            <VinaupLocation width={ICON_SIZES.xxl} height={ICON_SIZES.xxl} />
          </PressableOpacity>
          <View style={[styles.punchLabelContainer, styles.punchLabelRightContainer]}>
            <Text style={[styles.punchHintText, styles.punchDisabledText]}>Bấm</Text>
            <Text style={[styles.punchActionText, styles.punchDisabledText]}>Check out</Text>
          </View>
        </View>
      )}
      <UnifiedDatePicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        value={dayjs(selectedWorkDate, YYYY_MM_DD_DATE_FORMAT)}
        currentMode="day"
        modes={['day']}
        onChange={handleWorkDateChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topContainer: {
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  datePickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
  },
  clockText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal900,
    marginLeft: SPACING.sm,
  },
  togglerText: {
    fontSize: FONT_SIZES.sm,
  },
  punchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
  },
  punchButton: {
    width: AVATAR_SIZES.lg,
    height: AVATAR_SIZES.lg,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.teal700,
    alignItems: 'center',
    justifyContent: 'center',
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
