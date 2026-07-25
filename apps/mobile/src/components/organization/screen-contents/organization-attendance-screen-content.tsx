import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static';
import dayjs from 'dayjs';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Suspense, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { EntityListSectionSkeleton } from '@/components/commons/skeletons/entity-list-section-skeleton';
import { AttendanceModeToggler } from '@/components/organization/attendance/attendance-mode-toggler';
import { AttendancePunchBar } from '@/components/organization/attendance/attendance-punch-bar';
import { AttendanceRecordListSection } from '@/components/organization/attendance/list/attendance-record-list-section';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { UnifiedDatePicker } from '@/components/primitives/unified-date-picker';
import { DD_MM_DATE_FORMAT_SHORT, YYYY_MM_DD_DATE_FORMAT } from '@/constants/app-constants';
import { DEFAULT_ORGANIZATION_TIMEZONE } from '@/constants/organization-constants';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, ICON_SIZES, SPACING } from '@/constants/style-constants';
import { useCurrentMinute } from '@/hooks/use-current-minute';
import { useOrganizationContext } from '@/providers/auth/organization-provider';
import { OrganizationAttendancePunchProvider } from '@/providers/organization/attendance/organization-attendance-punch-provider';
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
      <Suspense fallback={<EntityListSectionSkeleton />}>
        <OrganizationAttendancePunchProvider organizationId={organizationId}>
          <View style={styles.topContainer}>
            <View style={styles.leftContainer}>
              <PressableOpacity
                onPress={() => setPickerVisible(true)}
                style={styles.datePickerTrigger}
              >
                <FontAwesome5 name="calendar-alt" size={ICON_SIZES.sm} color={COLORS.teal700} />
                {isLiveWorkDate && <Text style={styles.todayText}>Hôm nay</Text>}
                <Text style={styles.dateText}>
                  {dayjs(selectedWorkDate, YYYY_MM_DD_DATE_FORMAT).format(DD_MM_DATE_FORMAT_SHORT)}
                </Text>
              </PressableOpacity>
              {isLiveWorkDate && (
                <Text style={styles.clockText}>{generateZonedTime(now, organizationTimezone)}</Text>
              )}
            </View>
            {isLiveWorkDate && <AttendanceModeToggler />}
          </View>
          {isLiveWorkDate && <AttendancePunchBar organizationId={organizationId} />}
          <Suspense fallback={<EntityListSectionSkeleton />}>
            <OrganizationAttendanceRecordListProvider
              key={`organization-attendance-record-list-${organizationId}-${selectedWorkDate}`}
              organizationId={organizationId}
              workDate={selectedWorkDate}
            >
              <AttendanceRecordListSection organizationTimezone={organizationTimezone} />
            </OrganizationAttendanceRecordListProvider>
          </Suspense>
        </OrganizationAttendancePunchProvider>
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
    gap: SPACING.xs,
  },
  todayText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal700,
  },
  dateText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
  },
  clockText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal900,
    marginLeft: SPACING.sm,
  },
});
