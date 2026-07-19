import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import VinaupArrowWithTail from '@/components/icons/vinaup-arrow-with-tail.native';
import { OutlinedTextInput } from '@/components/primitives/outlined-text-input';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/style-constants';
import { useFormatIntegerInput } from '@/hooks/use-format-integer-input';
import { useReceiptPaymentListInTourImplementationContext } from '@/providers/organization/tour/receipt-payment-list-in-tour-implementation-provider';
import { useTourImplementationContext } from '@/providers/organization/tour/tour-implementation-provider';
import { calculateReceiptPaymentsSummary } from '@/utils/calculator/calculate-receipt-payments-summary';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';
import { generateLocaleFormatString } from '@/utils/generator/string-generator/generate-locale-format-string';
import { generateRawDigitString } from '@/utils/generator/string-generator/generate-raw-digit-string';

export function TourImplementationSummaryBarTourGuide() {
  const { tourGuideReceiptPayments } = useReceiptPaymentListInTourImplementationContext();
  const {
    tourImplementation,
    isMemberAssigned,
    isUpdatingImplementation,
    updateTourImplementation,
  } = useTourImplementationContext();

  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpand = () => setIsExpanded((prev) => !prev);

  const { totalPayment: tourGuideSpending } =
    calculateReceiptPaymentsSummary(tourGuideReceiptPayments);

  // ─── Step 1: HDV advance, independent from the director's advanceAmount ─────
  // Director edits it inline (commit on blur); the assigned tour guide only reads it.
  const [tourGuideAdvanceAmount, setTourGuideAdvanceAmount] = useState(
    generateRawDigitString(tourImplementation.tourGuideAdvanceAmount),
  );
  const { displayValue: advanceAmountDisplay, onDisplayValueChange: onAdvanceAmountChange } =
    useFormatIntegerInput(tourGuideAdvanceAmount, setTourGuideAdvanceAmount);

  // ─── Step 2: Derive from the live input, not the persisted value ─────
  // Lets "Tổng cộng" update while typing, before the refetch from the commit lands.
  const effectiveAdvance = Number(tourGuideAdvanceAmount) || 0;
  const remaining = effectiveAdvance - tourGuideSpending;

  const commitAdvance = () =>
    updateTourImplementation(
      { tourGuideAdvanceAmount: effectiveAdvance },
      {
        onError: (e) =>
          Alert.alert('Lỗi', generateErrorMessage(e, 'Có lỗi xảy ra khi cập nhật tạm ứng HDV.')),
      },
    );

  return (
    <View style={styles.container}>
      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.bottomContainer}>
            <View style={styles.innerBottomContainer}>
              <View style={styles.innerLeft}>
                <View style={styles.colFlex11}>
                  <Text>Tạm ứng HDV: </Text>
                </View>
                <View style={styles.colFlex1} />
              </View>
              <View style={styles.innerRight}>
                {isMemberAssigned ? (
                  <OutlinedTextInput
                    style={{ container: styles.amountInputContainer, input: styles.amountInput }}
                    value={advanceAmountDisplay}
                    onChangeText={onAdvanceAmountChange}
                    onBlur={commitAdvance}
                    keyboardType="numeric"
                    placeholder="0"
                    isLoading={isUpdatingImplementation}
                    rightSection={<Text style={styles.inputUnit}>đ</Text>}
                  />
                ) : (
                  <Text>{generateLocaleFormatString(effectiveAdvance)} đ</Text>
                )}
              </View>
            </View>

            <View style={styles.innerBottomContainer}>
              <View style={styles.innerLeft}>
                <View style={styles.colFlex11}>
                  <Text>HDV chi ra: </Text>
                </View>
                <View style={styles.colFlex1} />
              </View>
              <View style={styles.innerRight}>
                <Text>{generateLocaleFormatString(tourGuideSpending)} đ</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      <View style={styles.summaryRow}>
        <View style={styles.summaryLeft}>
          <View style={[styles.colFlex11, { justifyContent: 'space-between' }]}>
            <Pressable onPress={toggleExpand} hitSlop={8}>
              <VinaupArrowWithTail
                width={16}
                height={16}
                color={COLORS.yellow400}
                style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
              />
            </Pressable>
            <Text style={styles.remainingLabel}>Tổng cộng: </Text>
          </View>
          <View style={styles.colFlex1} />
        </View>
        <View style={styles.summaryRight}>
          <Text style={styles.remainingValue}>{generateLocaleFormatString(remaining)} </Text>
          <Text>đ</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: COLORS.yellow50,
    borderTopWidth: 1.5,
    borderTopColor: COLORS.yellow400,
  },
  expandedContent: {
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.sm,
    gap: SPACING.sm,
  },
  bottomContainer: {
    alignItems: 'flex-end',
    gap: SPACING['2xs'],
    borderBottomColor: COLORS.gray400,
    borderBottomWidth: 1,
    paddingBottom: SPACING.xs,
  },
  innerBottomContainer: {
    flexDirection: 'row',
    marginVertical: SPACING.xs,
  },
  innerLeft: {
    flex: 7,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  colFlex11: {
    flex: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: SPACING.xs,
  },
  colFlex1: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  innerRight: {
    flex: 4,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  summaryLeft: {
    flex: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryRight: {
    flex: 4,
    justifyContent: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
  },
  remainingLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal900,
  },
  remainingValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal900,
  },
  amountInputContainer: {
    flex: 1,
    paddingHorizontal: SPACING.xs,
    backgroundColor: COLORS.white,
  },
  amountInput: {
    height: 26,
    fontSize: FONT_SIZES.sm,
    flex: 1,
  },
  inputUnit: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
  },
});
