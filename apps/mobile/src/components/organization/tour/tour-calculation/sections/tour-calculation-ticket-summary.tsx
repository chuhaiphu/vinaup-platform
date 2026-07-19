import FontAwesome from '@react-native-vector-icons/fontawesome/static';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { type ApiError } from 'fetchwire';
import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';

import { TourTicketSummaryInfoPopover } from '@/components/organization/tour/shared/popovers/tour-ticket-summary-info-popover';
import { OutlinedTextInput } from '@/components/primitives/outlined-text-input';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import {
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  ICON_SIZES,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';
import { useFormatDecimalInput } from '@/hooks/use-format-decimal-input';
import { useFormatIntegerInput } from '@/hooks/use-format-integer-input';
import { useTourCalculationContext } from '@/providers/organization/tour/tour-calculation-provider';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';
import { generateRawDigitString } from '@/utils/generator/string-generator/generate-raw-digit-string';

interface TourCalculationTicketSummaryProps {
  id: string;
  tourId: string;
  onUpdated?: () => void;
  adultTicketCount?: number;
  childTicketCount?: number;
  adultTicketPrice?: number;
  childTicketPrice?: number;
  taxRate?: number;
  totalReceipt: string;
  totalPayment: string;
  vatGTGT: string;
  vatDeducted: string;
  totalTaxPay: string;
  netProfitAfterTaxPay: string;
  profitMarginAfterTaxPay: string;
}

export function TourCalculationTicketSummary({
  onUpdated,
  adultTicketCount = 0,
  childTicketCount = 0,
  adultTicketPrice = 0,
  childTicketPrice = 0,
  taxRate = 0,
  totalReceipt,
  totalPayment,
  vatGTGT,
  vatDeducted,
  totalTaxPay,
  netProfitAfterTaxPay,
  profitMarginAfterTaxPay,
}: TourCalculationTicketSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isInfoPopoverVisible, setIsInfoPopoverVisible] = useState(false);

  const { updateTourCalculation, isUpdatingCalculation } = useTourCalculationContext();

  // ─── Ticket quantity/price state ─────
  // Why: each value commits independently onBlur, so each gets its own raw/display pair
  // instead of a single form object — mirrors the pattern in ReceiptPaymentsSummaryBar.
  const [adultCountRaw, setAdultCountRaw] = useState(generateRawDigitString(adultTicketCount));
  const [childCountRaw, setChildCountRaw] = useState(generateRawDigitString(childTicketCount));
  const [adultPriceRaw, setAdultPriceRaw] = useState(generateRawDigitString(adultTicketPrice));
  const [childPriceRaw, setChildPriceRaw] = useState(generateRawDigitString(childTicketPrice));

  const { displayValue: adultCountDisplay, onDisplayValueChange: onAdultCountChange } =
    useFormatIntegerInput(adultCountRaw, setAdultCountRaw);
  const { displayValue: childCountDisplay, onDisplayValueChange: onChildCountChange } =
    useFormatIntegerInput(childCountRaw, setChildCountRaw);
  const { displayValue: adultPriceDisplay, onDisplayValueChange: onAdultPriceChange } =
    useFormatIntegerInput(adultPriceRaw, setAdultPriceRaw);
  const { displayValue: childPriceDisplay, onDisplayValueChange: onChildPriceChange } =
    useFormatIntegerInput(childPriceRaw, setChildPriceRaw);

  const handleUpdateError = (error: ApiError) => {
    Alert.alert('Lỗi', generateErrorMessage(error, 'Có lỗi xảy ra khi cập nhật.'));
  };

  const commitAdultCount = () =>
    updateTourCalculation(
      { adultTicketCount: Number(adultCountRaw) || 0 },
      { onSuccess: onUpdated, onError: handleUpdateError },
    );
  const commitChildCount = () =>
    updateTourCalculation(
      { childTicketCount: Number(childCountRaw) || 0 },
      { onSuccess: onUpdated, onError: handleUpdateError },
    );
  const commitAdultPrice = () =>
    updateTourCalculation(
      { adultTicketPrice: Number(adultPriceRaw) || 0 },
      { onSuccess: onUpdated, onError: handleUpdateError },
    );
  const commitChildPrice = () =>
    updateTourCalculation(
      { childTicketPrice: Number(childPriceRaw) || 0 },
      { onSuccess: onUpdated, onError: handleUpdateError },
    );

  // ─── Tax rate state ─────
  const [taxRateRaw, setTaxRateRaw] = useState(taxRate ? String(taxRate) : '');
  const { displayValue: taxRateDisplay, onDisplayValueChange: onTaxRateChange } =
    useFormatDecimalInput(taxRateRaw, setTaxRateRaw, { max: 20 });
  const commitTaxRate = () =>
    updateTourCalculation(
      { taxRate: Number(taxRateRaw) || 0 },
      { onSuccess: onUpdated, onError: handleUpdateError },
    );

  return (
    <View style={styles.container}>
      <View style={[styles.innerContainer, !isExpanded && styles.innerContainerCollapsed]}>
        <View style={[styles.headerContainer, !isExpanded && styles.headerContainerCollapsed]}>
          <View style={styles.innerHeaderContainer}>
            <Text style={styles.innerHeaderTitle}>Nhập số lượng & giá bán</Text>
            <PressableOpacity
              onPress={() => setIsExpanded(!isExpanded)}
              hitSlop={4}
              style={styles.expandToggle}
            >
              <FontAwesome
                name={isExpanded ? 'caret-down' : 'caret-up'}
                size={ICON_SIZES.lg}
                color={COLORS.teal700}
              />
            </PressableOpacity>
          </View>
          <View style={styles.ticketInputRow}>
            <OutlinedTextInput
              style={{
                container: styles.ticketPriceInputContainer,
                input: styles.ticketPriceInput,
              }}
              value={adultPriceDisplay}
              onChangeText={onAdultPriceChange}
              onBlur={commitAdultPrice}
              isLoading={isUpdatingCalculation}
              keyboardType="numeric"
              placeholder="0"
              leftSection={
                <View style={styles.ticketLeftSection}>
                  <Text style={styles.ticketLabel}>Khách lớn</Text>
                  <OutlinedTextInput
                    style={{
                      container: styles.ticketCountInputContainer,
                      input: styles.ticketCountInput,
                    }}
                    value={adultCountDisplay}
                    onChangeText={onAdultCountChange}
                    onBlur={commitAdultCount}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
              }
              rightSection={<Text style={styles.ticketInputUnit}>đ</Text>}
            />
          </View>
          <View style={styles.ticketInputRow}>
            <OutlinedTextInput
              style={{
                container: styles.ticketPriceInputContainer,
                input: styles.ticketPriceInput,
              }}
              value={childPriceDisplay}
              onChangeText={onChildPriceChange}
              onBlur={commitChildPrice}
              isLoading={isUpdatingCalculation}
              keyboardType="numeric"
              placeholder="0"
              leftSection={
                <View style={styles.ticketLeftSection}>
                  <Text style={styles.ticketLabel}>Trẻ em</Text>
                  <OutlinedTextInput
                    style={{
                      container: styles.ticketCountInputContainer,
                      input: styles.ticketCountInput,
                    }}
                    value={childCountDisplay}
                    onChangeText={onChildCountChange}
                    onBlur={commitChildCount}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
              }
              rightSection={<Text style={styles.ticketInputUnit}>đ</Text>}
            />
          </View>
        </View>

        {isExpanded && (
          <View style={styles.contentContainer}>
            <View style={styles.midContentPrice}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tổng thu</Text>
                <Text style={styles.summaryLabel}>Tổng chi</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryValueBold}>{totalReceipt}</Text>
                <Text style={styles.summaryValueBold}>{totalPayment}</Text>
              </View>
            </View>

            <View style={styles.midContentTax}>
              <View style={styles.summaryRow}>
                <View style={styles.taxLabelGroup}>
                  <Text style={styles.summaryLabel}>Thuế GTGT</Text>
                  <OutlinedTextInput
                    style={{
                      container: styles.taxRateInputContainer,
                      input: styles.taxRateInput,
                    }}
                    value={taxRateDisplay}
                    onChangeText={onTaxRateChange}
                    onBlur={commitTaxRate}
                    isLoading={isUpdatingCalculation}
                    keyboardType="numeric"
                    placeholder="0"
                    rightSection={<Text style={styles.taxRateUnit}>%</Text>}
                  />
                </View>
                <Text style={styles.summaryValue}>{vatGTGT}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Thuế khấu trừ</Text>
                <Text style={styles.summaryValue}>{vatDeducted}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Thuế phải nộp</Text>
                <Text style={styles.summaryValue}>{totalTaxPay}</Text>
              </View>
            </View>

            <View style={styles.botContent}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryLabelWithIcon}>
                  <Text style={styles.summaryLabelBold}>Lãi sau thuế</Text>
                  <PressableOpacity onPress={() => setIsInfoPopoverVisible(true)} hitSlop={4}>
                    <Ionicons
                      name="information-circle-sharp"
                      size={ICON_SIZES.md}
                      color={COLORS.yellow400}
                    />
                  </PressableOpacity>
                </View>
                <Text style={styles.summaryValueBold}>{netProfitAfterTaxPay}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tỷ suất lợi nhuận</Text>
                <Text style={[styles.summaryValue, styles.profitMarginValue]}>
                  {profitMarginAfterTaxPay} %
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
      <TourTicketSummaryInfoPopover
        isVisible={isInfoPopoverVisible}
        onClose={() => setIsInfoPopoverVisible(false)}
        label="Tính giá"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.sm,
  },
  innerContainer: {
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.3)',
    borderColor: COLORS.teal700,
  },
  innerContainerCollapsed: {
    paddingBottom: SPACING.xs,
  },
  headerContainer: {
    flexDirection: 'column',
    gap: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  headerContainerCollapsed: {
    borderBottomWidth: 0,
  },
  innerHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  innerHeaderTitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.gray600,
  },
  expandToggle: {},
  contentContainer: {},
  ticketInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketPriceInputContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.sm,
    gap: SPACING.xs,
    borderWidth: 0,
  },
  ticketPriceInput: {
    flex: 1,
    height: 36,
    fontSize: FONT_SIZES.base,
  },
  ticketLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketLabel: {
    width: 80,
    fontSize: FONT_SIZES.base,
    color: COLORS.teal900,
  },
  ticketCountInputContainer: {
    width: 48,
    height: 28,
    paddingHorizontal: SPACING.xs,
    backgroundColor: COLORS.green50,
  },
  ticketCountInput: {
    flex: 1,
    fontSize: FONT_SIZES.base,
  },
  ticketInputUnit: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal700,
  },
  midContentPrice: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    // boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.1)',
  },
  midContentTax: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.green50,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    // boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.1)',
  },
  botContent: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING['2xs'],
  },
  summaryLabel: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal900,
  },
  summaryLabelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  summaryLabelBold: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal900,
    fontWeight: FONT_WEIGHTS.bold,
  },
  summaryValue: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal900,
  },
  summaryValueBold: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal900,
  },
  profitMarginValue: {
    color: COLORS.red600,
  },
  taxLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  taxRateInputContainer: {
    width: 56,
    height: 28,
    paddingHorizontal: SPACING.xs,
    backgroundColor: COLORS.white,
  },
  taxRateInput: {
    height: 24,
    fontSize: FONT_SIZES.base,
  },
  taxRateUnit: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal700,
  },
});
