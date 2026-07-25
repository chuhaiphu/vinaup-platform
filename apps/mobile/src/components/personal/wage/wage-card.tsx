import dayjs from 'dayjs';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DD_MM_DATE_FORMAT_SHORT, HH_MM_DATE_FORMAT_SHORT } from '@/constants/app-constants';
import {
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  LINE_HEIGHTS,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';
import { WageStatusDisplay } from '@/constants/wage-constants';
import { WageResponse } from '@/interfaces/wage-interfaces';
import { generateLocaleFormatString } from '@/utils/generator/string-generator/generate-locale-format-string';

interface WageCardProps {
  wage?: WageResponse;
  onPress?: () => void;
  totalRemaining?: number;
}

export function WageCard({ wage, onPress, totalRemaining }: WageCardProps) {
  if (!wage) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text>Không có dữ liệu</Text>
        </View>
      </View>
    );
  }

  const getDateRangeText = () => {
    const start = dayjs(wage.startDate);
    const end = dayjs(wage.endDate);
    if (start.isSame(end, 'day')) {
      return (
        <Text style={styles.dateRangeText}>
          {start.format(DD_MM_DATE_FORMAT_SHORT)}{' '}
          <Text style={styles.hourText}>({start.format(HH_MM_DATE_FORMAT_SHORT)})</Text>
        </Text>
      );
    }
    return (
      <Text style={styles.dateRangeText}>
        {start.format(DD_MM_DATE_FORMAT_SHORT)}{' '}
        <Text style={styles.hourText}>({start.format(HH_MM_DATE_FORMAT_SHORT)})</Text>
        {' - '}
        {end.format(DD_MM_DATE_FORMAT_SHORT)}{' '}
        <Text style={styles.hourText}>({end.format(HH_MM_DATE_FORMAT_SHORT)})</Text>
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.innerHeader}>
        <View style={styles.left}>{getDateRangeText()}</View>
        <View style={styles.right}>
          <Text style={styles.statusText}>{WageStatusDisplay[wage.status]}</Text>
        </View>
      </View>
      <Pressable onPress={onPress}>
        <View style={styles.content}>
          <View style={styles.topRow}>
            <View style={styles.descriptionContainer}>
              <Text ellipsizeMode="tail" numberOfLines={2} style={styles.descriptionText}>
                {wage.description}
              </Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.totalPriceText}>
                {generateLocaleFormatString(totalRemaining ?? 0, 'vi-VN')}
              </Text>
              <Text style={styles.unitText}>đ</Text>
            </View>
          </View>
          <View style={styles.bottomRow}>
            <Text style={styles.infoText} numberOfLines={1} ellipsizeMode="tail">
              {wage.externalOrganizationName || ''}
            </Text>
          </View>
        </View>
      </Pressable>
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
  dateRangeText: {
    fontSize: FONT_SIZES.sm,
  },
  hourText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
  },
  statusText: {
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
    gap: SPACING.sm,
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
  descriptionContainer: {
    flex: 2,
  },
  descriptionText: {
    fontSize: FONT_SIZES.base,
    lineHeight: LINE_HEIGHTS.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal700,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: SPACING.xs,
    flex: 1,
  },
  totalPriceText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.gray700,
  },
  unitText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
  },
});
