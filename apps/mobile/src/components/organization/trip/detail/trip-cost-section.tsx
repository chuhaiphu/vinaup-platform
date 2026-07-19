import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static';
import { useRouter } from 'expo-router';
import React, { useImperativeHandle } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import {
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  ICON_SIZES,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';
import { useReceiptPaymentListInTripContext } from '@/providers/commons/receipt-payment/receipt-payment-list-in-trip-provider';
import { useTripDetailContext } from '@/providers/organization/trip/trip-detail-provider';
import { calculateTripCostSummaries } from '@/utils/calculator/calculate-trip-cost-summaries';
import { generateLocaleFormatString } from '@/utils/generator/string-generator/generate-locale-format-string';

export interface TripCostSectionRef {
  refresh: () => void;
}

export function TripCostSection({ ref }: { ref?: React.Ref<TripCostSectionRef> }) {
  const router = useRouter();

  const { trip, tripId } = useTripDetailContext();
  const { receiptPayments, refreshFetch } = useReceiptPaymentListInTripContext();

  useImperativeHandle(ref, () => ({ refresh: refreshFetch }), [refreshFetch]);

  const summary = calculateTripCostSummaries(receiptPayments, {
    rentalPrice: trip.rentalPrice,
    taxRate: trip.taxRate,
    commissionRate: trip.commissionRate,
  });

  const handlePress = () => {
    router.push({
      pathname: '/(protected)/trip-detail/[tripId]/trip-cost',
      params: { tripId },
    });
  };

  return (
    <View style={styles.sectionContainer}>
      <PressableOpacity style={styles.block} onPress={handlePress}>
        <Text style={styles.label}>Thu chi chuyến xe</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.amountText}>
            {generateLocaleFormatString(summary.netProfitAfterTaxPay)} đ
          </Text>
          <FontAwesome5
            iconStyle="solid"
            name="chevron-right"
            size={ICON_SIZES.sm}
            color={COLORS.teal700}
          />
        </View>
      </PressableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    paddingHorizontal: SPACING.sm,
    // marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  block: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.green50,
    borderColor: COLORS.teal700,
    boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  label: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal700,
  },
  amountContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  amountText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.teal700,
  },
});
