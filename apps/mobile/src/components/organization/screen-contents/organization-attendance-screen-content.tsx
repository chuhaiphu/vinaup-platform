import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static';
import { ATTENDANCE_MODE, type AttendanceMode } from '@vinaup-platform/validation';
import dayjs from 'dayjs';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Suspense, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { EntityListSectionSkeleton } from '@/components/commons/skeletons/entity-list-section-skeleton';
import VinaupLeftRightArrows from '@/components/icons/vinaup-left-right-arrows.native';
import { AttendancePunchBar } from '@/components/organization/attendance/attendance-punch-bar';
import { AttendanceRecordListSection } from '@/components/organization/attendance/list/attendance-record-list-section';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { TextToggler } from '@/components/primitives/text-toggler';
import { UnifiedDatePicker } from '@/components/primitives/unified-date-picker';
import { DD_MM_YYYY_DATE_FORMAT, YYYY_MM_DD_DATE_FORMAT } from '@/constants/app-constants';
import { DEFAULT_ORGANIZATION_TIMEZONE } from '@/constants/organization-constants';
import { COLORS, FONT_SIZES, ICON_SIZES, SPACING } from '@/constants/style-constants';
import { useCurrentMinute } from '@/hooks/use-current-minute';
import { useOrganizationContext } from '@/providers/auth/organization-provider';
import { OrganizationAttendanceRecordListProvider } from '@/providers/organization/attendance/organization-attendance-record-list-provider';
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
      <Suspense fallback={<EntityListSectionSkeleton />}>
        <OrganizationAttendanceRecordListProvider
          key={`organization-attendance-record-list-${organizationId}-${selectedWorkDate}`}
          organizationId={organizationId}
          workDate={selectedWorkDate}
        >
          {isLiveWorkDate && (
            <AttendancePunchBar organizationId={organizationId} attendanceMode={attendanceMode} />
          )}
          <AttendanceRecordListSection organizationTimezone={organizationTimezone} />
        </OrganizationAttendanceRecordListProvider>
      </Suspense>
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
});
