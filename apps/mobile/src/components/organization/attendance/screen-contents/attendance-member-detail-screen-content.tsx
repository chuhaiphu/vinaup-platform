import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static';
import dayjs from 'dayjs';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Suspense, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { EntityListSectionSkeleton } from '@/components/commons/skeletons/entity-list-section-skeleton';
import { AttendanceConclusionBar } from '@/components/organization/attendance/bars/attendance-conclusion-bar';
import { AttendanceMemberRecordListSection } from '@/components/organization/attendance/list/attendance-member-record-list-section';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { UnifiedDatePicker } from '@/components/primitives/unified-date-picker';
import { DD_MM_DATE_FORMAT_SHORT, YYYY_MM_DD_DATE_FORMAT } from '@/constants/app-constants';
import { DEFAULT_ORGANIZATION_TIMEZONE } from '@/constants/organization-constants';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, ICON_SIZES, SPACING } from '@/constants/style-constants';
import { useCurrentMinute } from '@/hooks/use-current-minute';
import { useScreenHeader } from '@/hooks/use-screen-header';
import { useOrganizationContext } from '@/providers/auth/organization-provider';
import { AttendanceRecordListInOrganizationProvider } from '@/providers/organization/attendance/attendance-record-list-in-organization-provider';
import { OrganizationAttendanceConclusionListProvider } from '@/providers/organization/attendance/organization-attendance-conclusion-list-provider';
import { generateCalendarDate } from '@/utils/generator/string-generator/generate-calendar-date';

export function AttendanceMemberDetailScreenContent() {
  const router = useRouter();

  const { organizationId, organizationMemberId, organizationMemberName, workDate } =
    useLocalSearchParams<{
      organizationId: string;
      organizationMemberId: string;
      organizationMemberName?: string;
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

  useScreenHeader({ title: organizationMemberName || 'Chấm công' });

  const handleWorkDateChange = (date: dayjs.Dayjs) => {
    router.setParams({ workDate: date.format(YYYY_MM_DD_DATE_FORMAT) });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <PressableOpacity onPress={() => setPickerVisible(true)} style={styles.datePickerTrigger}>
          <FontAwesome5 name="calendar-alt" size={ICON_SIZES.sm} color={COLORS.teal700} />
          {isLiveWorkDate && <Text style={styles.todayText}>Hôm nay</Text>}
          <Text style={styles.dateText}>
            {dayjs(selectedWorkDate, YYYY_MM_DD_DATE_FORMAT).format(DD_MM_DATE_FORMAT_SHORT)}
          </Text>
        </PressableOpacity>
      </View>

      <Suspense fallback={<EntityListSectionSkeleton />}>
        <AttendanceRecordListInOrganizationProvider
          key={`organization-attendance-record-list-in-organization-${organizationId}-${selectedWorkDate}`}
          organizationId={organizationId}
          workDate={selectedWorkDate}
        >
          <OrganizationAttendanceConclusionListProvider
            key={`organization-attendance-conclusion-list-${organizationId}-${selectedWorkDate}`}
            organizationId={organizationId}
            workDate={selectedWorkDate}
          >
            <AttendanceMemberRecordListSection
              organizationMemberId={organizationMemberId}
              organizationTimezone={organizationTimezone}
            />
            <AttendanceConclusionBar
              organizationMemberId={organizationMemberId}
              organizationMemberName={organizationMemberName}
            />
          </OrganizationAttendanceConclusionListProvider>
        </AttendanceRecordListInOrganizationProvider>
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
});
