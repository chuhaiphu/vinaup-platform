import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static';
import dayjs from 'dayjs';
import { useLocalSearchParams } from 'expo-router';
import { Suspense, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { BookingListSectionSkeleton } from '@/components/commons/skeletons/booking-list-section-skeleton';
import { BookingListSection } from '@/components/organization/booking/list/booking-list-section';
import { FilterSelect } from '@/components/primitives/filter-select';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { UnifiedDatePicker } from '@/components/primitives/unified-date-picker';
import { MM_YYYY_DATE_FORMAT } from '@/constants/app-constants';
import { BookingStatusOptions } from '@/constants/booking-constants';
import { COLORS, FONT_SIZES, ICON_SIZES, SPACING } from '@/constants/style-constants';
import { OrganizationBookingListProvider } from '@/providers/organization/booking/organization-booking-list-provider';

export function OrganizationBookingScreenContent() {
  const { organizationId } = useLocalSearchParams<{ organizationId: string }>();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [statusFilter, setStatusFilter] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);

  const suspenseKey = `org-booking-list-${organizationId}-${selectedDate.format('YYYY-MM')}-${statusFilter}`;

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <PressableOpacity onPress={() => setPickerVisible(true)} style={styles.datePickerTrigger}>
          <FontAwesome5
            name="calendar-alt"
            size={ICON_SIZES.sm}
            color={COLORS.teal700}
            style={{ marginRight: SPACING.sm }}
          />
          <Text style={styles.dateText}>{selectedDate.format(MM_YYYY_DATE_FORMAT)}</Text>
        </PressableOpacity>
        <FilterSelect
          placeholder="Trạng thái"
          options={BookingStatusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          align="right"
        />
      </View>
      <UnifiedDatePicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        value={selectedDate}
        currentMode="month"
        modes={['month']}
        onChange={(date) => setSelectedDate(date)}
      />

      <Suspense fallback={<BookingListSectionSkeleton />}>
        <OrganizationBookingListProvider
          key={suspenseKey}
          organizationId={organizationId}
          selectedDate={selectedDate}
          statusFilter={statusFilter}
        >
          <BookingListSection
            organizationId={organizationId}
            selectedDate={selectedDate}
            statusFilter={statusFilter}
          />
        </OrganizationBookingListProvider>
      </Suspense>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topContainer: {
    marginHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datePickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
  },
});
