import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { prefetch } from 'fetchwire';
import React, { Suspense, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { getBookingById } from '@/apis/booking/booking-apis';
import { BookingListSectionSkeleton } from '@/components/commons/skeletons/booking-list-section-skeleton';
import VinaupAddNew from '@/components/icons/vinaup-add-new.native';
import { BookingListSection } from '@/components/organization/booking/list/booking-list-section';
import { Button } from '@/components/primitives/button';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { UnifiedDatePicker } from '@/components/primitives/unified-date-picker';
import { MM_YYYY_DATE_FORMAT } from '@/constants/app-constants';
import { COLORS, FONT_SIZES, ICON_SIZES, SPACING } from '@/constants/style-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import { BookingTourImplementationListProvider } from '@/providers/organization/booking/booking-tour-implementation-list-provider';
import { useTourImplementationContext } from '@/providers/organization/tour/tour-implementation-provider';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

interface Props {
  tourImplementationId: string;
  organizationId: string;
}

export function BookingTourImplementationTabPanel({ tourImplementationId, organizationId }: Props) {
  const router = useRouter();
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [pickerVisible, setPickerVisible] = useState(false);
  const { createBookingForTourImplementation, isCreatingBooking: isMutating } =
    useTourImplementationContext();

  const suspenseKey = `tour-impl-booking-list-${tourImplementationId}-${selectedDate.format('YYYY-MM')}`;

  const handleAddNew = () => {
    createBookingForTourImplementation(organizationId, {
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
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <PressableOpacity onPress={() => setPickerVisible(true)} style={styles.datePickerTrigger}>
          <FontAwesome5
            name="calendar-alt"
            size={ICON_SIZES.md}
            color={COLORS.teal700}
            style={{ marginRight: SPACING.sm }}
          />
          <Text style={styles.dateText}>{selectedDate.format(MM_YYYY_DATE_FORMAT)}</Text>
        </PressableOpacity>
        <Button onPress={handleAddNew} isLoading={isMutating}>
          <VinaupAddNew width={24} height={24} iconColor={COLORS.white} />
        </Button>
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
        <BookingTourImplementationListProvider
          key={suspenseKey}
          tourImplementationId={tourImplementationId}
          selectedDate={selectedDate}
        >
          <BookingListSection
            organizationId={organizationId}
            tourImplementationId={tourImplementationId}
            selectedDate={selectedDate}
          />
        </BookingTourImplementationListProvider>
      </Suspense>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
  },
  datePickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal700,
  },
});
