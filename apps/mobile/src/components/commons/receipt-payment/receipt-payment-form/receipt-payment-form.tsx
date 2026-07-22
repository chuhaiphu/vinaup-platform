import FontAwesome6 from '@react-native-vector-icons/fontawesome6/static';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons/static';
import { useLocalSearchParams } from 'expo-router';
import React, { useRef } from 'react';
import { View, Text, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { VinaupLogoPrimary } from '@/components/icons/vinaup-logo-primary.native';
import VinaupTextLogo from '@/components/icons/vinaup-text-logo.native';
import VinaupVerticalHalfArrow from '@/components/icons/vinaup-vertical-half-arrow.native';
import { DateTimePicker } from '@/components/primitives/date-time-picker';
import { OutlinedTextInput } from '@/components/primitives/outlined-text-input';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { TextToggler } from '@/components/primitives/text-toggler';
import {
  ReceiptPaymentType,
  ReceiptPaymentGroupCodeDisplay,
  RECEIPT_PAYMENT_GROUP_CODE,
} from '@/constants/receipt-payment-constants';
import { COLORS, ICON_SIZES } from '@/constants/style-constants';
import { useFormatDecimalInput } from '@/hooks/use-format-decimal-input';
import { useFormatIntegerInput } from '@/hooks/use-format-integer-input';
import { useKeyboardVisibility } from '@/hooks/use-keyboard-visibility';
import { FieldErrors } from '@/hooks/use-validated-fields';
import { calculateVatAmount } from '@/utils/calculator/calculate-vat-amount';
import { generateLocaleFormatString } from '@/utils/generator/string-generator/generate-locale-format-string';

import { styles } from './receipt-payment-form.styles';
import { FlatTextInput } from '../../../primitives/flat-text-input';
import type { ReceiptPaymentFieldValues } from '../../screen-contents/receipt-payment-detail-screen-content';
import { ReceiptPaymentCategorySelectModal } from '../receipt-payment-category-select-modal/receipt-payment-category-select-modal';

type ReceiptPaymentFormParams = {
  receiptPaymentType?: ReceiptPaymentType;
  organizationId?: string;
  projectId?: string;
  invoiceId?: string;
  bookingId?: string;
  tourCalculationId?: string;
  tourImplementationId?: string;
  tourSettlementId?: string;
  wageId?: string;
  tripId?: string;
  carMaintenanceLogId?: string;
};

type ReceiptPaymentFormProps = {
  fieldValues: ReceiptPaymentFieldValues;
  fieldErrors: FieldErrors<keyof ReceiptPaymentFieldValues>;
  setFieldValue: <Field extends keyof ReceiptPaymentFieldValues>(
    field: Field,
    value: ReceiptPaymentFieldValues[Field],
  ) => void;
  setFieldValues: (values: Partial<ReceiptPaymentFieldValues>) => void;
};

function resolveFormVisibility(params: ReceiptPaymentFormParams) {
  if (params.wageId) {
    return {
      isIncludedVat: false,
      isIncludedFrequency: false,
      isIncludedReceipt: true,
      isIncludedPayment: false,
      isLockedCategory: false,
      isIncludedDeposit: false,
      isIncludedGroupCode: false,
    };
  }
  if (params.invoiceId) {
    if (params.receiptPaymentType === 'RECEIPT') {
      return {
        isIncludedVat: true,
        isIncludedFrequency: false,
        isIncludedReceipt: true,
        isIncludedPayment: false,
        isLockedCategory: false,
        isIncludedDeposit: false,
        isIncludedGroupCode: false,
      };
    } else
      return {
        isIncludedVat: true,
        isIncludedFrequency: false,
        isIncludedReceipt: false,
        isIncludedPayment: true,
        isLockedCategory: false,
        isIncludedDeposit: false,
        isIncludedGroupCode: false,
      };
  }
  if (params.tourCalculationId) {
    return {
      isIncludedVat: true,
      isIncludedFrequency: true,
      isIncludedReceipt: false,
      isIncludedPayment: true,
      isLockedCategory: true,
      isIncludedDeposit: false,
      isIncludedGroupCode: false,
    };
  }
  if (params.tourSettlementId) {
    return {
      isIncludedVat: true,
      isIncludedFrequency: true,
      isIncludedReceipt: true,
      isIncludedPayment: true,
      isLockedCategory: true,
      isIncludedDeposit: false,
      isIncludedGroupCode: false,
    };
  }
  if (params.tourImplementationId) {
    return {
      isIncludedVat: true,
      isIncludedFrequency: true,
      isIncludedReceipt: false,
      isIncludedPayment: true,
      isLockedCategory: false,
      isIncludedDeposit: true,
      isIncludedGroupCode: true,
    };
  }
  if (params.bookingId) {
    return {
      isIncludedVat: true,
      isIncludedFrequency: true,
      isIncludedReceipt: true,
      isIncludedPayment: true,
      isLockedCategory: false,
      isIncludedDeposit: false,
      isIncludedGroupCode: false,
    };
  }
  if (params.tripId) {
    // Revenue is entered as rentalPrice (VAT-bearing), so the list is expenses-only — lock
    // out "Thu" like tourCalculation. Otherwise a RECEIPT here adds untaxed revenue that
    // escapes vatGTGT (levied on rentalPrice only) and distorts profit/tax.
    return {
      isIncludedVat: true,
      isIncludedFrequency: true,
      isIncludedReceipt: false,
      isIncludedPayment: true,
      isLockedCategory: false,
      isIncludedDeposit: false,
      isIncludedGroupCode: false,
    };
  }
  if (params.carMaintenanceLogId) {
    return {
      isIncludedVat: true,
      isIncludedFrequency: false,
      isIncludedReceipt: false,
      isIncludedPayment: true,
      isLockedCategory: false,
      isIncludedDeposit: false,
      isIncludedGroupCode: false,
    };
  }
  return {
    isIncludedVat: true,
    isIncludedFrequency: false,
    isIncludedReceipt: true,
    isIncludedPayment: true,
    isLockedCategory: false,
    isIncludedDeposit: false,
    isIncludedGroupCode: false,
  };
}

/**
 * Full-screen receipt/payment entry form. Purely presentational — field values, errors, and
 * setters all come from the parent's `useValidatedFields` instance; this component only
 * renders inputs and derives the on-screen totals from the current values.
 *
 * Reads route params via `useLocalSearchParams` only to derive which fields are visible via
 * `resolveFormVisibility`.
 */
export function ReceiptPaymentForm({
  fieldValues,
  fieldErrors,
  setFieldValue,
  setFieldValues,
}: ReceiptPaymentFormProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<ReceiptPaymentFormParams>();
  const {
    isIncludedVat,
    isIncludedFrequency,
    isIncludedReceipt,
    isIncludedPayment,
    isLockedCategory,
    isIncludedDeposit,
    isIncludedGroupCode,
  } = resolveFormVisibility(params);

  const {
    description,
    unitPrice,
    quantity,
    frequency,
    type,
    vatRate,
    transactionType,
    note,
    transactionDate,
    categoryId,
    categoryName,
    groupCode,
    depositAmount,
    depositType,
  } = fieldValues;

  const { displayValue: displayUnitPrice, onDisplayValueChange: onUnitPriceChange } =
    useFormatIntegerInput(unitPrice, (raw) => setFieldValue('unitPrice', raw));
  const { displayValue: displayQuantity, onDisplayValueChange: onQuantityChange } =
    useFormatIntegerInput(quantity, (raw) => setFieldValue('quantity', raw));
  const { displayValue: displayFrequency, onDisplayValueChange: onFrequencyChange } =
    useFormatIntegerInput(frequency, (raw) => setFieldValue('frequency', raw));
  const { displayValue: displayDepositAmount, onDisplayValueChange: onDepositAmountChange } =
    useFormatIntegerInput(depositAmount, (raw) => setFieldValue('depositAmount', raw));

  const categorySelectModalRef = useRef<SlideSheetRef | null>(null);

  // ─── VAT rate input ─────
  const { displayValue: vatRateDisplay, onDisplayValueChange: onVatRateChange } =
    useFormatDecimalInput(vatRate, (raw) => setFieldValue('vatRate', raw), { max: 20 });

  // ─── Deposit type inline toggle ─────
  // Why: the modal carried the Bank/Cash switch; tapping the (CK)/(TM) label now
  // flips it so the row stays a single line without a separate switcher.
  const toggleDepositType = () =>
    setFieldValue('depositType', depositType === 'BANK' ? 'CASH' : 'BANK');

  const total =
    (Number.parseFloat(unitPrice) || 0) *
    (Number.parseFloat(String(quantity)) || 1) *
    (Number.parseFloat(String(frequency)) || 1);
  const vatDeduction = calculateVatAmount(total, Number.parseFloat(String(vatRate)) || 0);
  const paymentAmount = total - (Number.parseFloat(depositAmount) || 0);
  const formattedTotal = generateLocaleFormatString(total);
  const formattedVatDeduction = generateLocaleFormatString(vatDeduction);
  const formattedPaymentAmount = generateLocaleFormatString(paymentAmount);
  const { isKeyboardShow } = useKeyboardVisibility();

  const bankCashSwitcherNode = (
    <View style={styles.bankCashSwitcher}>
      <Pressable onPress={() => setFieldValue('transactionType', 'BANK')}>
        <Text
          style={[
            styles.bankCashSwitcherText,
            transactionType === 'BANK' && styles.bankCashSwitcherTextActive,
          ]}
        >
          Bank (CK)
        </Text>
      </Pressable>
      <Text style={styles.bankCashSwitcherSeparator}>|</Text>
      <Pressable onPress={() => setFieldValue('transactionType', 'CASH')}>
        <Text
          style={[
            styles.bankCashSwitcherText,
            transactionType === 'CASH' && styles.bankCashSwitcherTextActive,
          ]}
        >
          Cash (TM)
        </Text>
      </Pressable>
    </View>
  );

  // Category selector lives in the "Nội dung" label's right slot.
  const categorySelectorNode = isLockedCategory ? (
    categoryId ? (
      <View style={styles.categorySelector}>
        <Text style={styles.categorySelectorTextLocked}>{categoryName ?? 'Phân loại'}</Text>
      </View>
    ) : null
  ) : (
    <PressableOpacity
      style={styles.categorySelector}
      onPress={() => categorySelectModalRef.current?.open()}
    >
      <Text style={styles.categorySelectorText}>{categoryName ?? 'Phân loại'}</Text>
      <FontAwesome6
        iconStyle="solid"
        name="caret-down"
        size={ICON_SIZES.md}
        color={COLORS.teal700}
      />
    </PressableOpacity>
  );

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <VinaupLogoPrimary
            width={screenWidth / 2}
            height={screenHeight / 2}
            style={[styles.backgroundLogo, { top: 40, left: screenWidth / 2 }]}
            opacity={0.25}
            color={COLORS.gray300}
          />
          <View style={styles.typeSwitcherRow}>
            <View style={styles.typeBtnContainer}>
              <Pressable
                style={[
                  styles.typeBtn,
                  !isIncludedReceipt
                    ? styles.typeBtnDisabled
                    : type === 'RECEIPT'
                      ? styles.typeBtnActive
                      : styles.typeBtnInactive,
                ]}
                onPress={() => setFieldValue('type', 'RECEIPT')}
                disabled={!isIncludedReceipt}
              >
                <View style={styles.typeBtnInner}>
                  <MaterialCommunityIcons name="plus" size={ICON_SIZES.lg} color={COLORS.gray50} />
                  <View style={styles.typeBtnTextContainer}>
                    <Text
                      style={[styles.typeBtnText, type === 'RECEIPT' && styles.typeBtnTextActive]}
                    >
                      Thu
                    </Text>
                  </View>
                </View>
              </Pressable>
            </View>
            <View style={styles.dateRow}>
              <DateTimePicker
                value={transactionDate}
                onChange={(d) => {
                  const updated = transactionDate.year(d.year()).month(d.month()).date(d.date());
                  setFieldValue('transactionDate', updated);
                }}
                style={{ dateText: styles.datePickerText }}
              />
              <DateTimePicker
                mode="time"
                value={transactionDate}
                onChange={(d) => {
                  const updated = transactionDate.hour(d.hour()).minute(d.minute());
                  setFieldValue('transactionDate', updated);
                }}
                displayFormat="HH:mm"
                style={{ dateText: styles.datePickerText }}
              />
            </View>
            <View style={styles.typeBtnContainer}>
              <Pressable
                style={[
                  styles.typeBtn,
                  !isIncludedPayment
                    ? styles.typeBtnDisabled
                    : type === 'PAYMENT'
                      ? styles.typeBtnActive
                      : styles.typeBtnInactive,
                ]}
                onPress={() => setFieldValue('type', 'PAYMENT')}
                disabled={!isIncludedPayment}
              >
                <View style={styles.typeBtnInner}>
                  <View style={styles.typeBtnTextContainer}>
                    <Text
                      style={[styles.typeBtnText, type === 'PAYMENT' && styles.typeBtnTextActive]}
                    >
                      Chi
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="minus" size={ICON_SIZES.lg} color={COLORS.gray50} />
                </View>
              </Pressable>
            </View>
          </View>

          {isIncludedGroupCode && (
            <View style={styles.groupCodeRow}>
              <TextToggler
                textPair={[
                  ReceiptPaymentGroupCodeDisplay[RECEIPT_PAYMENT_GROUP_CODE.FOR_DIRECTOR],
                  ReceiptPaymentGroupCodeDisplay[RECEIPT_PAYMENT_GROUP_CODE.FOR_TOUR_GUIDE],
                ]}
                currentIndex={groupCode === RECEIPT_PAYMENT_GROUP_CODE.FOR_TOUR_GUIDE ? 1 : 0}
                onToggle={() =>
                  setFieldValue(
                    'groupCode',
                    groupCode === RECEIPT_PAYMENT_GROUP_CODE.FOR_TOUR_GUIDE
                      ? RECEIPT_PAYMENT_GROUP_CODE.FOR_DIRECTOR
                      : RECEIPT_PAYMENT_GROUP_CODE.FOR_TOUR_GUIDE,
                  )
                }
                rightSection={
                  <VinaupVerticalHalfArrow
                    height={16}
                    width={16}
                    color={COLORS.teal700}
                    style={{ transform: [{ rotate: '90deg' }] }}
                  />
                }
                style={{ text: styles.groupCodeLabel }}
              />
            </View>
          )}

          <FlatTextInput
            label="Nội dung"
            labelRightSection={categorySelectorNode}
            value={description}
            onChangeText={(val) => setFieldValue('description', val)}
            alignLabel="left"
            alignValue="left"
            error={fieldErrors.description}
            placeholder="..."
            maxLength={40}
          />

          <FlatTextInput
            label="Đơn giá"
            labelRightSection={bankCashSwitcherNode}
            value={displayUnitPrice}
            onChangeText={onUnitPriceChange}
            alignLabel="left"
            alignValue="left"
            error={fieldErrors.unitPrice}
            keyboardType="numeric"
            placeholder="0"
          />

          <FlatTextInput
            label="Số lượng"
            value={displayQuantity}
            onChangeText={onQuantityChange}
            alignLabel="left"
            alignValue="left"
            keyboardType="numeric"
            placeholder="1"
          />

          {isIncludedFrequency && (
            <FlatTextInput
              label="Số lần"
              value={displayFrequency}
              onChangeText={onFrequencyChange}
              alignLabel="left"
              alignValue="left"
              keyboardType="numeric"
              placeholder="1"
            />
          )}

          <FlatTextInput
            label="Ghi chú"
            value={note}
            onChangeText={(val) => setFieldValue('note', val)}
            alignLabel="left"
            alignValue="left"
            placeholder="..."
            maxLength={40}
          />

          <View style={styles.summaryBlock}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Thành tiền</Text>
              <View style={styles.summaryValueContainer}>
                <View style={styles.valueInnerContainer}>
                  <Text style={styles.summaryAmount}>{formattedTotal}</Text>
                  <Text style={styles.summaryUnit}>đ</Text>
                </View>
              </View>
            </View>

            {isIncludedDeposit && (
              <View style={styles.summaryRow}>
                <View style={styles.summaryLabelGroup}>
                  {/* Tap the (CK)/(TM) prefix to flip BANK <-> CASH */}
                  <Text style={styles.summaryLabel}>Đặt cọc</Text>
                  <Pressable onPress={toggleDepositType} style={styles.depositToggleContainer}>
                    <Text style={styles.depositToggleText}>
                      {depositType === 'BANK' ? 'Bank (CK)' : 'Cash (TM)'}
                    </Text>
                    <FontAwesome6
                      iconStyle="solid"
                      name="caret-down"
                      size={ICON_SIZES.sm}
                      color={COLORS.teal700}
                    />
                  </Pressable>
                </View>
                <OutlinedTextInput
                  style={{
                    container: styles.summaryValueContainer,
                    input: styles.summaryDepositInput,
                  }}
                  value={displayDepositAmount}
                  onChangeText={onDepositAmountChange}
                  keyboardType="numeric"
                  placeholder="0"
                  rightSection={<Text style={styles.summaryInputUnit}>đ</Text>}
                />
              </View>
            )}

            {isIncludedDeposit && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Thanh toán</Text>
                <View style={styles.summaryValueContainer}>
                  <View style={styles.valueInnerContainer}>
                    <Text style={styles.summaryAmount}>{formattedPaymentAmount}</Text>
                    <Text style={styles.summaryUnit}>đ</Text>
                  </View>
                </View>
              </View>
            )}

            {isIncludedVat && (
              <View style={[styles.summaryRow]}>
                <View style={styles.summaryLabelGroup}>
                  <Text style={styles.summaryLabel}>GTGT</Text>
                  <OutlinedTextInput
                    style={{
                      container: styles.vatRateInputContainer,
                      input: styles.vatRateInput,
                    }}
                    value={vatRateDisplay}
                    onChangeText={onVatRateChange}
                    keyboardType="numeric"
                    placeholder="0"
                    rightSection={<Text style={styles.summaryInputUnit}>%</Text>}
                  />
                </View>
                <View style={styles.summaryValueContainer}>
                  <View style={styles.valueInnerContainer}>
                    <Text style={styles.summaryAmount}>{formattedVatDeduction}</Text>
                    <Text style={styles.summaryUnit}>đ</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: isKeyboardShow ? 0 : insets.bottom }]}>
        <VinaupTextLogo width={64} height={24} />
      </View>
      <ReceiptPaymentCategorySelectModal
        modalRef={categorySelectModalRef}
        selectedCategoryId={categoryId}
        organizationId={params.organizationId}
        onSelect={(category) => {
          setFieldValues({
            categoryId: category?.id ?? null,
            categoryName: category?.name ?? null,
          });
        }}
      />
    </>
  );
}
