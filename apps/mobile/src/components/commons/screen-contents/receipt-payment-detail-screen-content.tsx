import DeleteIcon from '@expo/material-symbols/delete.xml';
import { createReceiptPaymentSchema } from '@vinaup-platform/validation';
import dayjs, { Dayjs } from 'dayjs';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, Platform, StyleSheet } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import { ReceiptPaymentForm } from '@/components/commons/receipt-payment/receipt-payment-form';
import {
  ReceiptPaymentDepositType,
  ReceiptPaymentGroupCode,
  ReceiptPaymentTransactionType,
  ReceiptPaymentType,
} from '@/constants/receipt-payment-constants';
import { COLORS } from '@/constants/style-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import { FieldErrors, FieldValidator, useValidatedFields } from '@/hooks/use-validated-fields';
import type { ToolbarIcon } from '@/interfaces/navigation-interfaces';
import { CreateReceiptPaymentRequest } from '@/interfaces/receipt-payment-interfaces';
import { useReceiptPaymentFormContext } from '@/providers/commons/receipt-payment/receipt-payment-form-provider';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

export type ReceiptPaymentFormParams = {
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

export type ReceiptPaymentFieldValues = {
  description: string;
  unitPrice: string;
  quantity: string;
  frequency: string;
  type: ReceiptPaymentType;
  vatRate: string;
  transactionType: ReceiptPaymentTransactionType;
  note: string;
  transactionDate: Dayjs;
  categoryId: string | null;
  categoryName: string | null;
  groupCode: string | null;
  depositAmount: string;
  depositType: ReceiptPaymentDepositType;
};

const DEFAULT_FIELD_VALUES: ReceiptPaymentFieldValues = {
  description: '',
  unitPrice: '',
  quantity: '',
  frequency: '',
  type: 'PAYMENT',
  vatRate: '',
  transactionType: 'CASH',
  note: '',
  transactionDate: dayjs(),
  categoryId: null,
  categoryName: null,
  groupCode: null,
  depositAmount: '',
  depositType: 'BANK',
};

export function ReceiptPaymentDetailScreenContent() {
  const router = useRouter();
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);
  const params = useLocalSearchParams<ReceiptPaymentFormParams>();
  const { receiptPaymentId } = params;
  const isUpdateMode = receiptPaymentId !== 'new';
  const {
    existingReceiptPayment,
    refreshDetail,
    createOrUpdateReceiptPayment,
    deleteReceiptPayment,
    isSaving,
    isDeleting,
  } = useReceiptPaymentFormContext();

  // unitPrice > 0 is a client-only rule — the schema only requires a number.
  // Field rules otherwise come from the shared schema, so messages match what the API returns.
  const validate: FieldValidator<
    ReceiptPaymentFieldValues,
    keyof ReceiptPaymentFieldValues,
    CreateReceiptPaymentRequest
  > = (values) => {
    const createReceiptPaymentReq: CreateReceiptPaymentRequest = {
      description: values.description,
      unitPrice: Number(values.unitPrice) || 0,
      quantity: Number(values.quantity) || 1,
      frequency: Number(values.frequency) || 1,
      type: values.type,
      vatRate: Number(values.vatRate) || 0,
      transactionType: values.transactionType,
      note: values.note.trim() || null,
      transactionDate: values.transactionDate.toISOString(),
      currency: 'VND',
      projectId: params.projectId,
      invoiceId: params.invoiceId,
      bookingId: params.bookingId,
      tourCalculationId: params.tourCalculationId,
      tourImplementationId: params.tourImplementationId,
      tourSettlementId: params.tourSettlementId,
      groupCode: values.groupCode ?? params.groupCode,
      organizationId: params.organizationId,
      // In update mode a removed category must clear the column, so null has to survive to the wire.
      categoryId: values.categoryId,
      wageId: params.wageId,
      tripId: params.tripId,
      carMaintenanceLogId: params.carMaintenanceLogId,
      depositAmount: Number(values.depositAmount) || 0,
      depositType: values.depositType,
    };

    const result = createReceiptPaymentSchema.safeParse(createReceiptPaymentReq);
    const fieldErrors: FieldErrors<keyof ReceiptPaymentFieldValues> = {};

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof ReceiptPaymentFieldValues;
        if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
      }
    }
    if (!values.unitPrice.trim() || Number(values.unitPrice) <= 0) {
      fieldErrors.unitPrice = 'Đơn giá phải lớn hơn 0';
    }

    if (Object.keys(fieldErrors).length > 0) return { success: false, fieldErrors };
    return { success: true, data: createReceiptPaymentReq };
  };

  const { fieldValues, fieldErrors, setFieldValue, setFieldValues, validateAll } =
    useValidatedFields(DEFAULT_FIELD_VALUES, validate);

  useEffect(() => {
    if (isUpdateMode) {
      if (!existingReceiptPayment) return;
      setFieldValues({
        description: existingReceiptPayment.description || '',
        unitPrice: existingReceiptPayment.unitPrice.toString(),
        quantity: existingReceiptPayment.quantity.toString(),
        frequency: existingReceiptPayment.frequency.toString(),
        type: existingReceiptPayment.type,
        vatRate: existingReceiptPayment.vatRate.toString(),
        transactionType: existingReceiptPayment.transactionType,
        note: existingReceiptPayment.note || '',
        transactionDate: dayjs(existingReceiptPayment.transactionDate),
        categoryId: existingReceiptPayment.categoryId ?? null,
        categoryName: existingReceiptPayment.category?.name ?? null,
        groupCode: existingReceiptPayment.tourImplementationReceiptPayments?.[0]?.groupCode ?? null,
        depositAmount: existingReceiptPayment.depositAmount?.toString() ?? '0',
        depositType: existingReceiptPayment.depositType ?? 'BANK',
      });
      return;
    }

    setFieldValues({
      description: '',
      unitPrice: '',
      quantity: '',
      frequency: '',
      type: params.receiptPaymentType || 'PAYMENT',
      vatRate: '',
      transactionType: 'CASH',
      note: '',
      transactionDate: params.transactionDate
        ? dayjs(params.transactionDate)
            .hour(dayjs().hour())
            .minute(dayjs().minute())
            .second(dayjs().second())
        : dayjs(),
      categoryId: params.categoryId ?? null,
      categoryName: params.categoryName ?? null,
      groupCode: params.groupCode ?? null,
      depositAmount: '',
      depositType: 'BANK',
    });
  }, [
    existingReceiptPayment,
    isUpdateMode,
    params.receiptPaymentType,
    params.transactionDate,
    params.categoryId,
    params.categoryName,
    params.groupCode,
    receiptPaymentId,
    setFieldValues,
  ]);

  const handleSaveAndExit = () => {
    const data = validateAll();
    if (!data) return;

    setIsNavigating(true);
    createOrUpdateReceiptPayment(data, {
      onSuccess: () => {
        if (isUpdateMode) refreshDetail();
        setIsNavigating(false);
        router.back();
      },
      onError: (error) => {
        setIsNavigating(false);
        Alert.alert('Lỗi', generateErrorMessage(error, 'Có lỗi xảy ra khi tạo thu/chi.'));
      },
    });
  };

  const handleDelete = () => {
    if (!isUpdateMode) return;
    Alert.alert('Xác nhận', 'Bạn muốn xoá?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'OK',
        style: 'destructive',
        onPress: () => {
          setIsNavigating(true);
          deleteReceiptPayment({
            onSuccess: () => {
              setIsNavigating(false);
              router.back();
            },
            onError: (error) => {
              setIsNavigating(false);
              Alert.alert('Lỗi', generateErrorMessage(error, 'Có lỗi xảy ra khi xóa.'));
            },
          });
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView style={styles.screenContainer} behavior={'padding'}>
      <Stack.Title>{isUpdateMode ? 'Sửa Thu Chi' : 'Tạo Thu Chi'}</Stack.Title>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon={require('@/assets/images/save_and_exit.png')}
          disabled={isSaving}
          accessibilityLabel="Lưu & thoát"
          onPress={handleSaveAndExit}
        />
        {isUpdateMode && (
          <Stack.Toolbar.Button
            icon={Platform.select<ToolbarIcon>({ ios: 'trash', android: DeleteIcon })}
            accessibilityLabel="Xoá"
            disabled={isDeleting}
            onPress={handleDelete}
          />
        )}
      </Stack.Toolbar>
      <ReceiptPaymentForm
        fieldValues={fieldValues}
        fieldErrors={fieldErrors}
        setFieldValue={setFieldValue}
        setFieldValues={setFieldValues}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
});
