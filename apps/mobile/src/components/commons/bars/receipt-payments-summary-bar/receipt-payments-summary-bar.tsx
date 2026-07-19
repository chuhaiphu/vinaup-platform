import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';

import VinaupArrowWithTail from '@/components/icons/vinaup-arrow-with-tail.native';
import { OutlinedTextInput } from '@/components/primitives/outlined-text-input';
import { Popover } from '@/components/primitives/popover';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { COLORS, ICON_SIZES, SPACING } from '@/constants/style-constants';
import { TourImplementationAdvanceType } from '@/constants/tour-constants';
import { useFormatDecimalInput } from '@/hooks/use-format-decimal-input';
import { useFormatIntegerInput } from '@/hooks/use-format-integer-input';
import { ReceiptPaymentResponse } from '@/interfaces/receipt-payment-interfaces';
import { calculateReceiptPaymentsSummary } from '@/utils/calculator/calculate-receipt-payments-summary';
import { generateLocaleFormatString } from '@/utils/generator/string-generator/generate-locale-format-string';
import { generateRawDigitString } from '@/utils/generator/string-generator/generate-raw-digit-string';

import { styles } from './receipt-payments-summary-bar.styles';

interface ReceiptPaymentsSummaryBarProps {
  receiptPayments?: ReceiptPaymentResponse[] | null;
  entityVatRate?: number;
  invoiceTypeCode?: string;
  entityDiscountAmount?: number;
  isIncludedSubTotal?: boolean;
  isIncludedTotalPayment?: boolean;
  isIncludedTotalReceipt?: boolean;
  isIncludedAdvance?: boolean;
  entityAdvanceAmount?: number;
  entityAdvanceType?: TourImplementationAdvanceType;
  isUpdatingAdvance?: boolean;
  onUpdateAdvance?: (
    value: { advanceAmount: string; advanceType: TourImplementationAdvanceType },
    onSuccessCallback: () => void,
  ) => void;
  isIncludedDeposit?: boolean;
  depositTotal?: number;
  onUpdateEntityVatRate?: (value: string) => void;
  isUpdatingEntityVatRate?: boolean;
  onUpdateEntityDiscountValue?: (value: string) => void;
  isUpdatingEntityDiscountValue?: boolean;
}

export function ReceiptPaymentsSummaryBar({
  receiptPayments,
  entityVatRate,
  invoiceTypeCode,
  entityDiscountAmount,
  isIncludedSubTotal = true,
  isIncludedTotalPayment = true,
  isIncludedTotalReceipt = true,
  isIncludedAdvance = false,
  entityAdvanceAmount,
  entityAdvanceType,
  isUpdatingAdvance,
  onUpdateAdvance,
  isIncludedDeposit = false,
  depositTotal,
  onUpdateEntityVatRate,
  isUpdatingEntityVatRate,
  onUpdateEntityDiscountValue,
  isUpdatingEntityDiscountValue,
}: ReceiptPaymentsSummaryBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVatInfoVisible, setIsVatInfoVisible] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(
    generateRawDigitString(entityDiscountAmount),
  );

  const [discountPercent, setDiscountPercent] = useState('');
  const [isDiscountPercentInputFocused, setIsDiscountPercentInputFocused] = useState(false);
  const [vatRateRaw, setVatRateRaw] = useState(entityVatRate ? String(entityVatRate) : '');
  const { displayValue: vatRateDisplay, onDisplayValueChange: onVatRateChange } =
    useFormatDecimalInput(vatRateRaw, setVatRateRaw, { max: 20 });
  const [advanceAmount, setAdvanceAmount] = useState(generateRawDigitString(entityAdvanceAmount));
  const [advanceType, setAdvanceType] = useState<TourImplementationAdvanceType>(
    entityAdvanceType ?? 'BANK',
  );

  const { displayValue: discountAmountDisplay, onDisplayValueChange: onDiscountAmountChange } =
    useFormatIntegerInput(discountAmount, setDiscountAmount);
  const { displayValue: advanceAmountDisplay, onDisplayValueChange: onAdvanceAmountChange } =
    useFormatIntegerInput(advanceAmount, setAdvanceAmount);

  const summary = calculateReceiptPaymentsSummary(receiptPayments);
  const effectiveAdvance = isIncludedAdvance ? Number(advanceAmount) || 0 : 0;
  const subTotal = summary.totalRemaining + effectiveAdvance;
  const isVATFromReceipts = summary.totalVAT > 0;

  const discountAmountNumber = Number(discountAmount);
  const totalAfterDiscount = isVATFromReceipts ? subTotal : subTotal - Number(discountAmount);
  const discountPercentNumber = subTotal > 0 ? (discountAmountNumber / subTotal) * 100 : 0;

  const discountPercentString = isDiscountPercentInputFocused
    ? discountPercent
    : generateLocaleFormatString(discountPercentNumber, 'vi-VN', 2);

  const vatRateNum = Number(vatRateRaw) || 0;
  // Additive VAT (rate applied on top), rounded to whole đồng at source with the app-wide
  // Math.round rule — computed once so the displayed line and the total reconcile exactly.
  const entityVatAmount = Math.round(totalAfterDiscount * (vatRateNum / 100));
  const finalTotalVat = isVATFromReceipts ? 0 : entityVatRate != null ? entityVatAmount : 0;
  const finalTotalRemaining = totalAfterDiscount + finalTotalVat;

  const toggleExpand = () => setIsExpanded((prev) => !prev);

  // ─── Discount handlers ─────
  const onDiscountAmountInputBlur = () => {
    onUpdateEntityDiscountValue?.(discountAmount);
  };
  const onDiscountPercentInputChange = (text: string) => {
    const sanitized = text.replace(/\./g, ','); // treat a typed dot as the vi-VN decimal comma
    setDiscountPercent(sanitized);
    // parseFloat needs a dot, so swap the comma back just for the math.
    const percent = Number.parseFloat(sanitized.replace(',', '.')) || 0;
    const amount = subTotal > 0 ? Math.round((subTotal * percent) / 100) : 0;
    setDiscountAmount(amount ? String(amount) : '');
  };
  const onDiscountPercentInputFocus = () => {
    setDiscountPercent(generateLocaleFormatString(discountPercentNumber, 'vi-VN', 2));
    setIsDiscountPercentInputFocused(true);
  };
  const onDiscountPercentInputBlur = () => {
    setIsDiscountPercentInputFocused(false);
    onUpdateEntityDiscountValue?.(discountAmount);
  };

  const commitVatRate = () => onUpdateEntityVatRate?.(vatRateRaw || '0');

  // ─── Advance handlers ─────
  const commitAdvance = (type: TourImplementationAdvanceType = advanceType) =>
    onUpdateAdvance?.({ advanceAmount: advanceAmount, advanceType: type }, () => {});
  const toggleAdvanceType = () => {
    const next = advanceType === 'BANK' ? 'CASH' : 'BANK';
    setAdvanceType(next);
    commitAdvance(next);
  };

  return (
    <View>
      <KeyboardStickyView style={styles.container}>
        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.topContainer}>
              <View style={styles.innerTopContainer}>
                <Text style={styles.innerLabel}>Tiền mặt</Text>
                <View style={styles.cashContent}>
                  <View style={styles.innerRow}>
                    <Text>Vào: </Text>
                    <Text>{generateLocaleFormatString(summary.cashIn)} đ</Text>
                  </View>
                  <View style={styles.innerRow}>
                    <Text>Ra: </Text>
                    <Text>{generateLocaleFormatString(summary.cashOut)} đ</Text>
                  </View>
                </View>
              </View>
              <View style={styles.innerTopContainer}>
                <Text style={[styles.innerLabel, { paddingLeft: SPACING.sm }]}>Chuyển khoản</Text>
                <View style={styles.bankContent}>
                  <View style={styles.innerRow}>
                    <Text>Vào: </Text>
                    <Text>{generateLocaleFormatString(summary.bankIn)} đ</Text>
                  </View>
                  <View style={styles.innerRow}>
                    <Text>Ra: </Text>
                    <Text>{generateLocaleFormatString(summary.bankOut)} đ</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.bottomContainer}>
              {isIncludedAdvance && (
                <View style={styles.innerBottomContainer}>
                  <View style={styles.innerLeft}>
                    <Text>Tạm ứng: </Text>
                    {!!onUpdateAdvance && (
                      <Pressable onPress={toggleAdvanceType} style={styles.typeToggle}>
                        <Text style={styles.typeToggleText}>
                          {advanceType === 'BANK' ? 'Bank (CK)' : 'Cash (TM)'}
                        </Text>
                        <FontAwesome5
                          iconStyle="solid"
                          name="caret-down"
                          size={ICON_SIZES.sm}
                          color={COLORS.teal700}
                        />
                      </Pressable>
                    )}
                  </View>
                  <View style={styles.innerRight}>
                    <OutlinedTextInput
                      style={{
                        container: styles.amountInputContainer,
                        input: styles.amountInput,
                      }}
                      value={advanceAmountDisplay}
                      onChangeText={onAdvanceAmountChange}
                      onBlur={() => commitAdvance()}
                      keyboardType="numeric"
                      placeholder="0"
                      isDisabled={!onUpdateAdvance}
                      isLoading={isUpdatingAdvance}
                      rightSection={
                        <Text
                          style={[styles.inputUnit, !onUpdateAdvance && styles.inputUnitDisabled]}
                        >
                          đ
                        </Text>
                      }
                    />
                  </View>
                </View>
              )}
              {isIncludedAdvance && (
                <View style={styles.innerBottomContainer}>
                  <View style={styles.innerLeft}>
                    <Text>Thu vào: </Text>
                  </View>
                  <View style={styles.innerRight}>
                    <Text>{generateLocaleFormatString(summary.totalReceipt)} đ</Text>
                  </View>
                </View>
              )}
              {isIncludedTotalReceipt && (
                <View style={styles.innerBottomContainer}>
                  <View style={styles.innerLeft}>
                    <Text style={isIncludedAdvance ? styles.boldLabel : undefined}>Tổng thu: </Text>
                  </View>
                  <View style={styles.innerRight}>
                    <Text style={isIncludedAdvance ? styles.boldValue : undefined}>
                      {generateLocaleFormatString(summary.totalReceipt + effectiveAdvance)}{' '}
                    </Text>
                    <Text>đ</Text>
                  </View>
                </View>
              )}
              {/* {isIncludedAdvance && <View style={styles.separator} />} */}
              {isIncludedDeposit && (
                <View style={styles.innerBottomContainer}>
                  <View style={styles.innerLeft}>
                    <Text>Đặt cọc: </Text>
                  </View>
                  <View style={styles.innerRight}>
                    <Text>{generateLocaleFormatString(depositTotal ?? 0)} đ</Text>
                  </View>
                </View>
              )}
              {isIncludedAdvance && (
                <View style={styles.innerBottomContainer}>
                  <View style={styles.innerLeft}>
                    <Text>Chi ra: </Text>
                  </View>
                  <View style={styles.innerRight}>
                    <Text>{generateLocaleFormatString(summary.totalPayment)} đ</Text>
                  </View>
                </View>
              )}
              {isIncludedTotalPayment && (
                <View style={styles.innerBottomContainer}>
                  <View style={styles.innerLeft}>
                    <Text style={isIncludedAdvance ? styles.boldLabel : undefined}>Tổng chi: </Text>
                  </View>
                  <View style={styles.innerRight}>
                    <Text style={isIncludedAdvance ? styles.boldValue : undefined}>
                      {generateLocaleFormatString(summary.totalPayment)}{' '}
                    </Text>
                    <Text>đ</Text>
                  </View>
                </View>
              )}
              {isVATFromReceipts && isIncludedSubTotal && (
                <View style={styles.innerBottomContainer}>
                  <View style={styles.innerLeft}>
                    <PressableOpacity hitSlop={8} onPress={() => setIsVatInfoVisible(true)}>
                      <Ionicons
                        name="information-circle-sharp"
                        size={ICON_SIZES.md}
                        color={COLORS.yellow400}
                      />
                    </PressableOpacity>
                    <Text style={styles.vatIncludedLabel}>Gồm thuế GTGT: </Text>
                  </View>
                  <View style={styles.innerRight}>
                    <Text style={styles.vatIncludedValue}>
                      {generateLocaleFormatString(summary.totalVAT)} đ
                    </Text>
                  </View>
                </View>
              )}
              {isIncludedSubTotal && (
                <View style={styles.innerBottomContainer}>
                  <View style={styles.innerLeft}>
                    <Text>Tổng tiền: </Text>
                  </View>
                  <View style={styles.innerRight}>
                    <Text>{generateLocaleFormatString(subTotal)} đ</Text>
                  </View>
                </View>
              )}
              {/* != null checks only undefined/null, so value 0 still renders */}
              {entityDiscountAmount != null && invoiceTypeCode === 'SELL' && (
                <View style={styles.innerBottomContainer}>
                  <View style={styles.innerLeft}>
                    <Text style={isVATFromReceipts ? styles.strikethrough : undefined}>
                      Giảm giá:{' '}
                    </Text>
                    <OutlinedTextInput
                      style={{
                        container: styles.percentInputContainer,
                        input: styles.percentInput,
                      }}
                      value={discountPercentString}
                      onChangeText={onDiscountPercentInputChange}
                      onFocus={onDiscountPercentInputFocus}
                      onBlur={onDiscountPercentInputBlur}
                      keyboardType="numeric"
                      placeholder="0"
                      isDisabled={isVATFromReceipts}
                      isLoading={isUpdatingEntityDiscountValue}
                      rightSection={
                        <Text
                          style={[styles.inputUnit, isVATFromReceipts && styles.inputUnitDisabled]}
                        >
                          %
                        </Text>
                      }
                    />
                  </View>
                  <View style={styles.innerRight}>
                    <OutlinedTextInput
                      style={{ container: styles.amountInputContainer, input: styles.amountInput }}
                      value={discountAmountDisplay}
                      onChangeText={onDiscountAmountChange}
                      onBlur={onDiscountAmountInputBlur}
                      keyboardType="numeric"
                      placeholder="0"
                      isDisabled={isVATFromReceipts}
                      isLoading={isUpdatingEntityDiscountValue}
                      rightSection={
                        <Text
                          style={[styles.inputUnit, isVATFromReceipts && styles.inputUnitDisabled]}
                        >
                          đ
                        </Text>
                      }
                    />
                  </View>
                </View>
              )}
              {/* != null checks only undefined/null, so value 0 still renders */}
              {entityVatRate != null && (
                <View style={styles.innerBottomContainer}>
                  <View style={styles.innerLeft}>
                    <Text style={isVATFromReceipts ? styles.strikethrough : undefined}>
                      Thuế GTGT:{' '}
                    </Text>
                    <OutlinedTextInput
                      style={{
                        container: styles.percentInputContainer,
                        input: styles.percentInput,
                      }}
                      value={vatRateDisplay}
                      onChangeText={onVatRateChange}
                      onBlur={commitVatRate}
                      keyboardType="numeric"
                      placeholder="0"
                      isDisabled={isVATFromReceipts}
                      isLoading={isUpdatingEntityVatRate}
                      rightSection={
                        <Text
                          style={[styles.inputUnit, isVATFromReceipts && styles.inputUnitDisabled]}
                        >
                          %
                        </Text>
                      }
                    />
                  </View>
                  <View style={styles.innerRight}>
                    <Text style={isVATFromReceipts ? styles.strikethrough : undefined}>
                      {generateLocaleFormatString(entityVatAmount)} đ
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.summaryRow}>
          <View style={styles.innerLeft}>
            <Pressable onPress={toggleExpand} hitSlop={24}>
              <VinaupArrowWithTail
                width={12}
                height={12}
                color={COLORS.teal700}
                style={{ transform: [{ rotate: isExpanded ? '0deg' : '180deg' }] }}
              />
            </Pressable>
            <Text style={styles.remainingLabel}>Tổng cộng: </Text>
          </View>
          <View style={styles.innerRight}>
            <Text style={styles.remainingValue}>
              {generateLocaleFormatString(finalTotalRemaining)}{' '}
            </Text>
            <Text>đ</Text>
          </View>
        </View>
      </KeyboardStickyView>
      <Popover
        isVisible={isVatInfoVisible}
        onClose={() => setIsVatInfoVisible(false)}
        variant="info"
        title="Thuế trong giá / Thuế sau giá"
        position={{ bottom: 50, left: 8, right: 8 }}
      >
        <Text style={styles.vatInfoPopoverContent}>
          Nếu trong ít nhất một Thu chi đã có gồm thuế GTGT, có nghĩa là giá bao gồm thuế, thì sẽ
          không được sửa Giảm giá và Thuế GTGT ở đây.
        </Text>
      </Popover>
    </View>
  );
}
