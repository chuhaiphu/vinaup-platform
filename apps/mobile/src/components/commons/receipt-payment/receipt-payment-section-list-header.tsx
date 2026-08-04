import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import VinaupAddNew from '@/components/icons/vinaup-add-new.native';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/style-constants';
import { ReceiptPaymentResponse } from '@/interfaces/receipt-payment-interfaces';
import { calculateReceiptPaymentsSummary } from '@/utils/calculator/calculate-receipt-payments-summary';
import { generateLocaleFormatString } from '@/utils/generator/string-generator/generate-locale-format-string';

interface ReceiptPaymentSectionListHeaderProps {
  title: string;
  isSumCalculationIncluded?: boolean;
  receiptPayments: ReceiptPaymentResponse[];
  onPressAddNew: () => void;
  canAdd?: boolean;
}

export function ReceiptPaymentSectionListHeader({
  title,
  isSumCalculationIncluded = true,
  receiptPayments,
  onPressAddNew,
  canAdd = true,
}: ReceiptPaymentSectionListHeaderProps) {
  const [isShowingPrice, setIsShowingPrice] = useState(true);
  const togglePrice = () => {
    setIsShowingPrice(!isShowingPrice);
  };
  return (
    <View style={styles.sectionHeader}>
      {isSumCalculationIncluded && (
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>{title}</Text>
          <PressableOpacity onPress={togglePrice}>
            <Text style={[styles.equalSignText, isShowingPrice && styles.equalSignActive]}>=</Text>
          </PressableOpacity>
          {isShowingPrice && (
            <Text style={styles.projectTotalAmountText}>
              {generateLocaleFormatString(
                calculateReceiptPaymentsSummary(receiptPayments || []).totalRemaining,
                'vi-VN',
              )}
            </Text>
          )}
        </View>
      )}
      <View />
      {canAdd && (
        <PressableOpacity onPress={onPressAddNew} style={styles.addNewButtonContainer}>
          <VinaupAddNew width={24} height={24} iconColor={COLORS.white} />
        </PressableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    marginVertical: SPACING.sm,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal900,
  },
  equalSignText: {
    fontSize: FONT_SIZES.xl,
    lineHeight: 20,
    paddingHorizontal: SPACING.xs,
    borderRadius: RADIUS.xs,
    color: COLORS.teal700,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },
  equalSignActive: {
    backgroundColor: 'transparent',
  },
  projectTotalAmountText: {
    fontSize: FONT_SIZES.base,
    flexShrink: 0,
  },
  addNewButtonContainer: {},
});
