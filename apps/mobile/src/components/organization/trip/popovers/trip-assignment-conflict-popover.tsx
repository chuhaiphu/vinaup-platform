import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { prefetch } from 'fetchwire';
import { StyleSheet, Text, View } from 'react-native';

import { getTripById } from '@/apis/trip/trip-apis';
import { Popover } from '@/components/primitives/popover';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { DD_MM_YYYY_DATE_FORMAT } from '@/constants/app-constants';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/style-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import { ConflictingTrip } from '@/interfaces/trip-interfaces';

interface TripAssignmentConflictPopoverProps {
  isVisible: boolean;
  onClose: () => void;
  conflictingTrips: ConflictingTrip[];
}

export function TripAssignmentConflictPopover({
  isVisible,
  onClose,
  conflictingTrips,
}: TripAssignmentConflictPopoverProps) {
  const router = useRouter();
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);

  const navigateToTripDetail = async (id?: string) => {
    if (!id) return;
    onClose();
    setIsNavigating(true);
    try {
      await prefetch(() => getTripById(id), { fetchKey: `organization-trip-${id}` });
    } catch {
      // Fallback to normal navigation if prefetch fails.
    }
    router.push({
      pathname: '/(protected)/trip-detail/[tripId]',
      params: { tripId: id },
    });
    setIsNavigating(false);
  };

  return (
    <Popover
      isVisible={isVisible}
      onClose={onClose}
      variant="warning"
      title="Cảnh báo trùng lịch"
      position={{ top: 320, left: 8, right: 8 }}
    >
      <View style={styles.tripList}>
        {conflictingTrips.map((trip) => (
          <View key={trip.id} style={styles.tripRow}>
            <PressableOpacity onPress={() => navigateToTripDetail(trip.id)}>
              <Text style={styles.tripTitle} numberOfLines={1}>
                {trip.description || 'Chuyến chưa đặt tên'}
              </Text>
              <Text style={styles.tripDateRange}>
                {dayjs(trip.startDate).format(DD_MM_YYYY_DATE_FORMAT)}{' '}
                <Text style={styles.tripHourText}>({dayjs(trip.startDate).format('HH:mm')})</Text> -{' '}
                {dayjs(trip.endDate).format(DD_MM_YYYY_DATE_FORMAT)}{' '}
                <Text style={styles.tripHourText}>({dayjs(trip.endDate).format('HH:mm')})</Text>
              </Text>
            </PressableOpacity>
          </View>
        ))}
      </View>
    </Popover>
  );
}

const styles = StyleSheet.create({
  tripList: {
    gap: SPACING.sm,
  },
  tripRow: {
    gap: SPACING['2xs'],
  },
  tripTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.blue600,
  },
  tripDateRange: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
  },
  tripHourText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
  },
});
