import { StyleSheet, Text, View } from 'react-native';

import { DateRangeText } from '@/components/commons/texts/date-range-text';
import {
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  LINE_HEIGHTS,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';
import { TourStatusDisplay } from '@/constants/tour-constants';
import { TourResponse } from '@/interfaces/tour-interfaces';

interface TourCardProps {
  tour?: TourResponse;
}

export function TourCard({ tour }: TourCardProps) {
  const getTourInfoText = () => {
    if (!tour) return '';
    return `${tour.externalOrganizationName || tour.organization?.name || ''}`;
  };

  if (!tour) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text>Không có dữ liệu</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.innerHeader}>
        <View style={styles.left}>
          <DateRangeText start={tour.startDate} end={tour.endDate} />
        </View>
        <View style={styles.right}>
          <Text style={styles.tourStatusText}>{TourStatusDisplay[tour.status]}</Text>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.descriptionText}>{tour.description}</Text>
          </View>
          <View>{tour.code && <Text style={styles.codeText}>{tour.code}</Text>}</View>
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.infoText} numberOfLines={1} ellipsizeMode="tail">
            {getTourInfoText()}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  innerHeader: {
    marginVertical: SPACING.sm,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  left: {
    flexDirection: 'row',
    gap: SPACING.xs,
    alignItems: 'center',
  },
  right: {},
  tourStatusText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal900,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.1)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
  },
  descriptionText: {
    fontSize: FONT_SIZES.base,
    lineHeight: LINE_HEIGHTS.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal700,
  },
  codeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
  },
});
