import FontAwesome6 from '@react-native-vector-icons/fontawesome6/static';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons/static';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useImperativeHandle, useRef } from 'react';
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
  ReceiptPaymentGroupCode,
  ReceiptPaymentGroupCodeDisplay,
  RECEIPT_PAYMENT_GROUP_CODE,
} from '@/constants/receipt-payment-constants';
import { COLORS, ICON_SIZES } from '@/constants/style-constants';
import { useFormatDecimalInput } from '@/hooks/use-format-decimal-input';
import { useFormatIntegerInput } from '@/hooks/use-format-integer-input';
import { useKeyboardVisibility } from '@/hooks/use-keyboard-visibility';
import { useReceiptPaymentFormStore } from '@/hooks/use-receipt-payment-form-store';
import { useReceiptPaymentFormContext } from '@/providers/commons/receipt-payment/receipt-payment-form-provider';
import { calculateVatAmount } from '@/utils/calculator/calculate-vat-amount';
import { generateLocaleFormatString } from '@/utils/generator/string-generator/generate-locale-format-string';

import { styles } from './receipt-payment-form.styles';
import { FlatTextInput } from '../../../primitives/flat-text-input';
import { ReceiptPaymentCategorySelectModal } from '../receipt-payment-category-select-modal/receipt-payment-category-select-modal';

type ReceiptPaymentFormParams = {
  receiptPaymentId: string;
  groupCode?: ReceiptPaymentGroupCode;
  organizationId?: string;
  receiptPaymentType?: ReceiptPaymentType;
  projectId?: string;
  invoiceId?: string;
  bookingId?: string;
  tourCalculationId?: string;
  tourImplementationId?: string;
  tourSettlementId?: string;
  transactionDate?: string;
  wageId?: string;
  tripId?: string;
  carMaintenanceLogId?: string;
  categoryId?: string;
  categoryName?: string;
};

export type ReceiptPaymentFormRef = {
  refreshDetail: () => void;
};

type ReceiptPaymentFormProps = {
  ref?: React.Ref<ReceiptPaymentFormRef>;
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
 * Full-screen receipt/payment entry form driven by `useReceiptPaymentFormStore`.
 *
 * Reads route params via `useLocalSearchParams` to derives which fields are visible via `resolveFormVisibility`:
 *
 * In update mode (`receiptPaymentId !== 'new'`), the form fetches the existing
 * record and populates the store. On unmount the store is reset.
 *
 * Exposes a `refreshDetail` imperative handle for parent screens to force a
 * re-fetch after a save.
 */
export function ReceiptPaymentForm({ ref }: ReceiptPaymentFormProps) {
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

  const initializeForm = useReceiptPaymentFormStore((s) => s.initializeForm);
  const resetForm = useReceiptPaymentFormStore((s) => s.resetForm);
  const description = useReceiptPaymentFormStore((s) => s.description);
  const setDescription = useReceiptPaymentFormStore((s) => s.setDescription);
  const unitPrice = useReceiptPaymentFormStore((s) => s.unitPrice);
  const setUnitPrice = useReceiptPaymentFormStore((s) => s.setUnitPrice);
  const quantity = useReceiptPaymentFormStore((s) => s.quantity);
  const setQuantity = useReceiptPaymentFormStore((s) => s.setQuantity);
  const frequency = useReceiptPaymentFormStore((s) => s.frequency);
  const setFrequency = useReceiptPaymentFormStore((s) => s.setFrequency);
  const type = useReceiptPaymentFormStore((s) => s.type);
  const setType = useReceiptPaymentFormStore((s) => s.setType);
  const vatRate = useReceiptPaymentFormStore((s) => s.vatRate);
  const setVatRate = useReceiptPaymentFormStore((s) => s.setVatRate);
  const transactionType = useReceiptPaymentFormStore((s) => s.transactionType);
  const setTransactionType = useReceiptPaymentFormStore((s) => s.setTransactionType);
  const note = useReceiptPaymentFormStore((s) => s.note);
  const setNote = useReceiptPaymentFormStore((s) => s.setNote);
  const transactionDate = useReceiptPaymentFormStore((s) => s.transactionDate);
  const setTransactionDate = useReceiptPaymentFormStore((s) => s.setTransactionDate);
  const inputErrors = useReceiptPaymentFormStore((s) => s.inputErrors);
  const setInputErrors = useReceiptPaymentFormStore((s) => s.setInputErrors);
  const validateByInputField = useReceiptPaymentFormStore((s) => s.validateByInputField);
  const categoryId = useReceiptPaymentFormStore((s) => s.categoryId);
  const categoryName = useReceiptPaymentFormStore((s) => s.categoryName);
  const setCategoryId = useReceiptPaymentFormStore((s) => s.setCategoryId);
  const setCategoryName = useReceiptPaymentFormStore((s) => s.setCategoryName);
  const groupCode = useReceiptPaymentFormStore((s) => s.groupCode);
  const setGroupCode = useReceiptPaymentFormStore((s) => s.setGroupCode);
  const depositAmount = useReceiptPaymentFormStore((s) => s.depositAmount);
  const setDepositAmount = useReceiptPaymentFormStore((s) => s.setDepositAmount);
  const depositType = useReceiptPaymentFormStore((s) => s.depositType);
  const setDepositType = useReceiptPaymentFormStore((s) => s.setDepositType);

  const { displayValue: displayUnitPrice, onDisplayValueChange: onUnitPriceChange } =
    useFormatIntegerInput(unitPrice, (raw) => {
      setUnitPrice(raw);
      setInputErrors({
        ...inputErrors,
        unitPrice: validateByInputField('unitPrice', raw),
      });
    });
  const { displayValue: displayQuantity, onDisplayValueChange: onQuantityChange } =
    useFormatIntegerInput(quantity, setQuantity);
  const { displayValue: displayFrequency, onDisplayValueChange: onFrequencyChange } =
    useFormatIntegerInput(frequency, setFrequency);
  const { displayValue: displayDepositAmount, onDisplayValueChange: onDepositAmountChange } =
    useFormatIntegerInput(depositAmount, setDepositAmount);

  const categorySelectModalRef = useRef<SlideSheetRef | null>(null);

  // ─── VAT rate input ─────
  const { displayValue: vatRateDisplay, onDisplayValueChange: onVatRateChange } =
    useFormatDecimalInput(vatRate, setVatRate, { max: 20 });

  // ─── Deposit type inline toggle ─────
  // Why: the modal carried the Bank/Cash switch; tapping the (CK)/(TM) label now
  // flips it so the row stays a single line without a separate switcher.
  const toggleDepositType = () => setDepositType(depositType === 'BANK' ? 'CASH' : 'BANK');

  const { receiptPaymentId } = params;
  const isUpdateMode = receiptPaymentId !== 'new';

  const { existingReceiptPayment, refreshDetail } = useReceiptPaymentFormContext();

  useImperativeHandle(ref, () => ({ refreshDetail }), [refreshDetail]);

  useEffect(() => {
    if (isUpdateMode) {
      initializeForm({ existingReceiptPayment });
    } else {
      initializeForm({
        receiptPaymentType: params.receiptPaymentType,
        transactionDate: params.transactionDate,
        categoryId: params.categoryId,
        categoryName: params.categoryName,
        groupCode: params.groupCode,
      });
    }
  }, [
    existingReceiptPayment,
    initializeForm,
    isUpdateMode,
    params.receiptPaymentType,
    params.transactionDate,
    params.categoryId,
    params.categoryName,
    params.groupCode,
    receiptPaymentId,
  ]);

  useEffect(
    () => () => {
      resetForm();
    },
    [resetForm],
  );

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
      <Pressable onPress={() => setTransactionType('BANK')}>
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
      <Pressable onPress={() => setTransactionType('CASH')}>
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
                onPress={() => setType('RECEIPT')}
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
                  setTransactionDate(updated);
                }}
                style={{ dateText: styles.datePickerText }}
              />
              <DateTimePicker
                mode="time"
                value={transactionDate}
                onChange={(d) => {
                  const updated = transactionDate.hour(d.hour()).minute(d.minute());
                  setTransactionDate(updated);
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
                onPress={() => setType('PAYMENT')}
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
                  setGroupCode(
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
            onChangeText={(val) => {
              setDescription(val);
              setInputErrors({
                ...inputErrors,
                description: validateByInputField('description', val),
              });
            }}
            alignLabel="left"
            alignValue="left"
            error={inputErrors.description}
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
            error={inputErrors.unitPrice}
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
            onChangeText={setNote}
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
          setCategoryId(category?.id ?? null);
          setCategoryName(category?.name ?? null);
        }}
      />
    </>
  );
}
