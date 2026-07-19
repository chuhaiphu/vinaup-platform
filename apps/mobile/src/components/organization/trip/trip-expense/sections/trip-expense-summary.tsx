import Ionicons from '@react-native-vector-icons/ionicons/static';
import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

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
import { useTripDetailContext } from '@/providers/organization/trip/trip-detail-provider';
import { generateLocaleFormatString } from '@/utils/generator/string-generator/generate-locale-format-string';
import { generateRawDigitString } from '@/utils/generator/string-generator/generate-raw-digit-string';

interface TripExpenseSummaryProps {
  onUpdated?: () => void;
  rentalPrice?: number;
  taxRate?: number;
  commissionRate?: number;
  totalReceipt: string;
  totalPayment: string;
  vatGTGT: string;
  vatDeducted: string;
  totalTaxPay: string;
  netProfitAfterTaxPay: string;
  profitMarginAfterTaxPay: string;
}

export function TripExpenseSummary({
  onUpdated,
  rentalPrice = 0,
  taxRate = 0,
  commissionRate = 0,
  totalReceipt,
  totalPayment,
  vatGTGT,
  vatDeducted,
  totalTaxPay,
  netProfitAfterTaxPay,
  profitMarginAfterTaxPay,
}: TripExpenseSummaryProps) {
  const [isInfoPopoverVisible, setIsInfoPopoverVisible] = useState(false);

  const { handleUpdateTrip } = useTripDetailContext();

  // ─── Rental price state ─────
  const [rentalPriceRaw, setRentalPriceRaw] = useState(generateRawDigitString(rentalPrice));
  const { displayValue: rentalPriceDisplay, onDisplayValueChange: onRentalPriceChange } =
    useFormatIntegerInput(rentalPriceRaw, setRentalPriceRaw);
  const commitRentalPrice = () =>
    handleUpdateTrip({ rentalPrice: Number(rentalPriceRaw) || 0 }, onUpdated);

  // ─── Tax rate state ─────
  const [taxRateRaw, setTaxRateRaw] = useState(taxRate ? String(taxRate) : '');
  const { displayValue: taxRateDisplay, onDisplayValueChange: onTaxRateChange } =
    useFormatDecimalInput(taxRateRaw, setTaxRateRaw, { max: 20 });
  const commitTaxRate = () => handleUpdateTrip({ taxRate: Number(taxRateRaw) || 0 }, onUpdated);

  // ─── Commission rate state ─────
  const [commissionRateRaw, setCommissionRateRaw] = useState(
    commissionRate ? String(commissionRate) : '',
  );
  const { displayValue: commissionRateDisplay, onDisplayValueChange: onCommissionRateChange } =
    useFormatDecimalInput(commissionRateRaw, setCommissionRateRaw);
  const commitCommissionRate = () =>
    handleUpdateTrip({ commissionRate: Number(commissionRateRaw) || 0 }, onUpdated);

  // ─── Driver rental fee (đ, two-way with commission rate) ─────
  const [driverFeeTyped, setDriverFeeTyped] = useState('');
  const [isDriverFeeFocused, setIsDriverFeeFocused] = useState(false);
  const driverFeeNumber = Math.round(
    ((Number(rentalPriceRaw) || 0) * (Number(commissionRateRaw) || 0)) / 100,
  );
  const driverFeeDisplay = isDriverFeeFocused
    ? driverFeeTyped
    : generateLocaleFormatString(driverFeeNumber);

  const onDriverFeeChange = (text: string) => {
    // đ is a whole-đồng integer, so strip every non-digit (no decimal separator here).
    const digitsOnlyStringValue = text.replace(/[^0-9]/g, '');
    setDriverFeeTyped(digitsOnlyStringValue);
    const rentalPriceNumber = Number(rentalPriceRaw) || 0;
    // Guard divide-by-zero: with no rental price the đ cannot map to a %, so leave it empty.
    const commissionRateNumber =
      rentalPriceNumber > 0 ? ((Number(digitsOnlyStringValue) || 0) / rentalPriceNumber) * 100 : 0;
    const roundedCommissionRate = Math.round(commissionRateNumber * 100) / 100;
    setCommissionRateRaw(roundedCommissionRate ? String(roundedCommissionRate) : '');
  };
  const onDriverFeeFocus = () => {
    // Seed the buffer with the derived amount (raw digits) so editing starts from the value shown.
    setDriverFeeTyped(driverFeeNumber ? String(driverFeeNumber) : '');
    setIsDriverFeeFocused(true);
  };
  const onDriverFeeBlur = () => {
    setIsDriverFeeFocused(false);
    commitCommissionRate();
  };

  return (
    <View style={styles.container}>
      {/* ─── Rental price ─── */}
      <OutlinedTextInput
        style={{ container: styles.rentalPriceInputContainer, input: styles.rentalPriceInput }}
        value={rentalPriceDisplay}
        onChangeText={onRentalPriceChange}
        onBlur={commitRentalPrice}
        // isLoading={isUpdatingTrip}
        keyboardType="numeric"
        placeholder="0"
        leftSection={<Text style={styles.rentalPriceLabel}>Giá cho thuê</Text>}
        rightSection={<Text style={styles.inputUnit}>đ</Text>}
      />

      {/* ─── Summary block (always expanded) ─── */}
      <View style={styles.innerContainer}>
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
                style={{ container: styles.rateInputContainer, input: styles.rateInput }}
                value={taxRateDisplay}
                onChangeText={onTaxRateChange}
                onBlur={commitTaxRate}
                // isLoading={isUpdatingTrip}
                keyboardType="numeric"
                placeholder="0"
                rightSection={<Text style={styles.rateUnit}>%</Text>}
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
      <Text style={{ fontSize: FONT_SIZES.base, color: COLORS.gray400 }}>
        Tổng chi = Tổng cộng chi phí bên dưới
      </Text>
      {/* ─── Driver rental (commission % of rental price) ─── */}
      <OutlinedTextInput
        style={{ container: styles.driverInputContainer, input: styles.driverInput }}
        value={driverFeeDisplay}
        onChangeText={onDriverFeeChange}
        onFocus={onDriverFeeFocus}
        onBlur={onDriverFeeBlur}
        // isLoading={isUpdatingTrip}
        keyboardType="numeric"
        placeholder="0"
        alignValue="right"
        leftSection={
          <View style={styles.driverLeftSection}>
            <Text style={styles.summaryLabel}>Tài xế</Text>
            <OutlinedTextInput
              style={{
                container: [styles.rateInputContainer, styles.commissionRateInputContainer],
                input: styles.rateInput,
              }}
              value={commissionRateDisplay}
              onChangeText={onCommissionRateChange}
              onBlur={commitCommissionRate}
              // isLoading={isUpdatingTrip}
              keyboardType="numeric"
              placeholder="0"
              rightSection={<Text style={styles.rateUnit}>%</Text>}
            />
            <Text style={styles.summaryLabel}>giá cho thuê</Text>
          </View>
        }
        rightSection={<Text style={styles.inputUnit}>đ</Text>}
      />

      <TourTicketSummaryInfoPopover
        isVisible={isInfoPopoverVisible}
        onClose={() => setIsInfoPopoverVisible(false)}
        label="Thu chi"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  rentalPriceInputContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.sm,
    justifyContent: 'space-between',
  },
  rentalPriceInput: {
    flex: 1,
    height: 36,
    fontSize: FONT_SIZES.base,
  },
  rentalPriceLabel: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal900,
  },
  driverInputContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.sm,
    justifyContent: 'space-between',
  },
  driverInput: {
    height: 36,
    fontSize: FONT_SIZES.base,
    minWidth: 60,
  },
  driverLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  inputUnit: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal700,
  },
  innerContainer: {
    padding: SPACING.sm,
    marginBottom: SPACING['2xs'],
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.3)',
    borderColor: COLORS.teal700,
  },
  midContentPrice: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  midContentTax: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.green50,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
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
  rateInputContainer: {
    width: 56,
    height: 28,
    paddingHorizontal: SPACING.xs,
    backgroundColor: COLORS.white,
  },
  commissionRateInputContainer: {
    backgroundColor: COLORS.green50,
  },
  rateInput: {
    height: 24,
    fontSize: FONT_SIZES.base,
  },
  rateUnit: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal700,
  },
});
