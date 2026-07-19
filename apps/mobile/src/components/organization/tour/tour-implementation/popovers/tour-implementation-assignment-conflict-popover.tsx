import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { prefetch } from 'fetchwire';
import { StyleSheet, Text, View } from 'react-native';

import { getTourById } from '@/apis/tour/tour-apis';
import { Popover } from '@/components/primitives/popover';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { DD_MM_YYYY_DATE_FORMAT } from '@/constants/app-constants';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/style-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import { ConflictingTour } from '@/interfaces/tour-implementation-interfaces';

interface TourImplementationAssignmentConflictPopoverProps {
  isVisible: boolean;
  onClose: () => void;
  conflictingTours: ConflictingTour[];
}

export function TourImplementationAssignmentConflictPopover({
  isVisible,
  onClose,
  conflictingTours,
}: TourImplementationAssignmentConflictPopoverProps) {
  const router = useRouter();
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);

  const navigateToTourDetail = async (id?: string) => {
    if (!id) return;
    onClose();
    setIsNavigating(true);
    try {
      await prefetch(() => getTourById(id), { fetchKey: `organization-tour-${id}` });
    } catch {
      // Fallback to normal navigation if prefetch fails.
    }
    router.push({
      pathname: '/(protected)/tour-detail/[tourId]',
      params: { tourId: id },
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
      <View style={styles.tourList}>
        {conflictingTours.map((tour) => (
          <View key={tour.id} style={styles.tourRow}>
            <PressableOpacity onPress={() => navigateToTourDetail(tour.id)}>
              <Text style={styles.tourTitle} numberOfLines={1}>
                {tour.description || 'Tour chưa đặt tên'}
              </Text>
              <Text style={styles.tourDateRange}>
                {dayjs(tour.startDate).format(DD_MM_YYYY_DATE_FORMAT)}{' '}
                <Text style={styles.tourHourText}>({dayjs(tour.startDate).format('HH:mm')})</Text> -{' '}
                {dayjs(tour.endDate).format(DD_MM_YYYY_DATE_FORMAT)}{' '}
                <Text style={styles.tourHourText}>({dayjs(tour.endDate).format('HH:mm')})</Text>
              </Text>
            </PressableOpacity>
          </View>
        ))}
      </View>
    </Popover>
  );
}

const styles = StyleSheet.create({
  tourList: {
    gap: SPACING.sm,
  },
  tourRow: {
    gap: SPACING['2xs'],
  },
  tourTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.blue600,
  },
  tourDateRange: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
  },
  tourHourText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
  },
});
