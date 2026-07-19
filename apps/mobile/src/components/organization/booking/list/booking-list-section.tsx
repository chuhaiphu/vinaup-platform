import type { BookingStatus } from '@vinaup-platform/validation';
import dayjs from 'dayjs';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { BookingCard } from '@/components/organization/booking/booking-card';
import { COLORS } from '@/constants/style-constants';
import { useBookingTourImplementationListContext } from '@/providers/organization/booking/booking-tour-implementation-list-provider';
import { useOrganizationBookingListContext } from '@/providers/organization/booking/organization-booking-list-provider';

export interface BookingListSectionProps {
  organizationId: string;
  selectedDate: dayjs.Dayjs;
  statusFilter?: BookingStatus;
  tourImplementationId?: string;
}

function BookingListByOrganization() {
  const { combinedBookings, isRefreshing, refreshFetch } = useOrganizationBookingListContext();

  return (
    <FlatList
      data={combinedBookings}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      keyExtractor={({ booking }) => booking.id}
      renderItem={({ item: { booking, isReceiver } }) => (
        <BookingCard booking={booking} isReceiver={isReceiver} />
      )}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refreshFetch}
          colors={[COLORS.teal700]}
        />
      }
    />
  );
}

function BookingListByTourImplementation() {
  const { bookings, refreshFetch, isRefreshing } = useBookingTourImplementationListContext();

  return (
    <FlatList
      data={bookings ?? []}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <BookingCard booking={item} isReceiver={false} />}
      scrollEnabled={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing ?? false}
          onRefresh={refreshFetch}
          colors={[COLORS.teal700]}
        />
      }
    />
  );
}

export function BookingListSection(props: BookingListSectionProps) {
  if (props.tourImplementationId) {
    return <BookingListByTourImplementation />;
  }
  return <BookingListByOrganization />;
}

const styles = StyleSheet.create({
  separator: {
    height: 2,
  },
});
