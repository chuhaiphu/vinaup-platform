import { Dayjs } from 'dayjs';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import VinaupLeftArrowBigHead from '@/components/icons/vinaup-left-arrow-big-head.native';
import VinaupPlusMinus from '@/components/icons/vinaup-plus-minus.native';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { DD_MM_YYYY_DATE_FORMAT } from '@/constants/app-constants';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/style-constants';
import { ReceiptPaymentResponse } from '@/interfaces/receipt-payment-interfaces';
import { calculateReceiptPaymentsSummary } from '@/utils/calculator/calculate-receipt-payments-summary';
import { generateLocaleFormatString } from '@/utils/generator/string-generator/generate-locale-format-string';

interface OrganizationHomeIndexSummaryProps {
  currentMonth: Dayjs;
  receiptPayments?: ReceiptPaymentResponse[] | null;
  organizationId: string;
}

export function OrganizationHomeIndexSummary({
  receiptPayments,
  currentMonth,
  organizationId,
}: OrganizationHomeIndexSummaryProps) {
  const summary = calculateReceiptPaymentsSummary(receiptPayments);
  const router = useRouter();

  const handlePress = () => {
    router.navigate({
      pathname: '/(protected)/organization/[organizationId]/(tabs)/invoice',
      params: {
        organizationId,
        invoiceType: 'SELL',
        month: currentMonth.format('YYYY-MM'),
      },
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.mainRow}>
        <View>
          <Text style={styles.label}>Thu mua hàng</Text>
          <Text>Ngày {currentMonth.format(DD_MM_YYYY_DATE_FORMAT)}</Text>
        </View>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{generateLocaleFormatString(summary.totalRemaining)}</Text>
          <Text>đ</Text>
        </View>
      </View>

      <PressableOpacity style={styles.banner} onPress={handlePress}>
        <View style={styles.bannerLeft}>
          <VinaupPlusMinus width={20} height={20} color={COLORS.teal700} />
          <Text style={styles.bannerText}>Xem thu mua hàng tháng này</Text>
        </View>
        <VinaupLeftArrowBigHead />
      </PressableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    boxShadow: '0px 1px 1px 1px rgba(0, 0, 0, 0.2)',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.teal700,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  value: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.teal900,
  },
  banner: {
    backgroundColor: COLORS.green50,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  bannerText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal700,
  },
});
