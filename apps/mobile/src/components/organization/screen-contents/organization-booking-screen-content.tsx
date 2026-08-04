import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static';
import { PERMISSION_ACTION, PERMISSION_RESOURCE } from '@vinaup-platform/permission';
import type { BookingStatus } from '@vinaup-platform/validation';
import dayjs from 'dayjs';
import { Stack, useRouter } from 'expo-router';
import { prefetch } from 'fetchwire';
import { Suspense, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';

import { getBookingById } from '@/apis/booking/booking-apis';
import { BookingListSectionSkeleton } from '@/components/commons/skeletons/booking-list-section-skeleton';
import { BookingListSection } from '@/components/organization/booking/list/booking-list-section';
import { FilterSelect } from '@/components/primitives/filter-select';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { UnifiedDatePicker } from '@/components/primitives/unified-date-picker';
import { MM_YYYY_DATE_FORMAT } from '@/constants/app-constants';
import { BookingStatusOptions } from '@/constants/booking-constants';
import { COLORS, FONT_SIZES, ICON_SIZES, SPACING } from '@/constants/style-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import { OrganizationBookingListProvider } from '@/providers/organization/booking/organization-booking-list-provider';
import { useOrganizationAbility } from '@/providers/organization/organization-ability-provider';
import { useOrganizationActionsContext } from '@/providers/organization/organization-actions-provider';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

export function OrganizationBookingScreenContent() {
  const router = useRouter();
  const { organizationId, can } = useOrganizationAbility();
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);
  const { createBooking, isCreatingBooking } = useOrganizationActionsContext();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');
  const [pickerVisible, setPickerVisible] = useState(false);

  const suspenseKey = `org-booking-list-${organizationId}-${selectedDate.format('YYYY-MM')}-${statusFilter}`;

  const handleAddNew = () => {
    createBooking(
      { organizationId },
      {
        onSuccess: async (data) => {
          const bookingId = data?.id || '';
          if (!bookingId) {
            Alert.alert('Lỗi', 'Không thể tạo Booking mới');
            return;
          }

          setIsNavigating(true);
          try {
            await prefetch(() => getBookingById(bookingId), {
              fetchKey: `organization-booking-${bookingId}`,
            });
          } catch {
            // Fallback to normal navigation if prefetch fails.
          }
          setIsNavigating(false);

          router.push({
            pathname: '/(protected)/booking-detail/[bookingId]',
            params: { bookingId },
          });
        },
        onError: (error) =>
          Alert.alert('Lỗi', generateErrorMessage(error, 'Không thể tạo Booking mới')),
      },
    );
  };

  return (
    <View style={styles.container}>
      {can(PERMISSION_ACTION.CREATE, PERMISSION_RESOURCE.BOOKING) && (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button
            icon={require('@/assets/images/add_new.png')}
            iconRenderingMode="original"
            disabled={isCreatingBooking}
            accessibilityLabel="Tạo booking"
            onPress={handleAddNew}
          />
        </Stack.Toolbar>
      )}
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
          statusFilter={statusFilter || undefined}
        >
          <BookingListSection
            organizationId={organizationId}
            selectedDate={selectedDate}
            statusFilter={statusFilter || undefined}
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
