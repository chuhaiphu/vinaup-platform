import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import {
  ReceiptPaymentForm,
  type ReceiptPaymentFormRef,
} from '@/components/commons/receipt-payment/receipt-payment-form';
import { ReceiptPaymentType, ReceiptPaymentGroupCode } from '@/constants/receipt-payment-constants';
import { COLORS } from '@/constants/style-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import { useReceiptPaymentFormStore } from '@/hooks/use-receipt-payment-form-store';
import { useScreenHeader } from '@/hooks/use-screen-header';
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

export function ReceiptPaymentDetailScreenContent() {
  const router = useRouter();
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);
  const formContentRef = useRef<ReceiptPaymentFormRef>(null);
  const params = useLocalSearchParams<ReceiptPaymentFormParams>();
  const { receiptPaymentId } = params;
  const isUpdateMode = receiptPaymentId !== 'new';
  const { createOrUpdateReceiptPayment, deleteReceiptPayment, isSaving, isDeleting } =
    useReceiptPaymentFormContext();
  const validateBeforeSave = useReceiptPaymentFormStore((state) => state.validateBeforeSave);

  const buildSubmitData = (): CreateReceiptPaymentRequest => {
    const formState = useReceiptPaymentFormStore.getState();
    return {
      description: formState.description,
      unitPrice: Number(formState.unitPrice),
      quantity: Number(formState.quantity) || 1,
      frequency: Number(formState.frequency) || 1,
      type: formState.type,
      vatRate: Number(formState.vatRate),
      transactionType: formState.transactionType,
      note: formState.note,
      transactionDate: formState.transactionDate.toISOString(),
      currency: 'VND',
      projectId: params.projectId,
      invoiceId: params.invoiceId,
      bookingId: params.bookingId,
      tourCalculationId: params.tourCalculationId,
      tourImplementationId: params.tourImplementationId,
      tourSettlementId: params.tourSettlementId,
      groupCode: formState.groupCode ?? params.groupCode,
      organizationId: params.organizationId,
      categoryId: formState.categoryId ?? undefined,
      wageId: params.wageId,
      tripId: params.tripId,
      carMaintenanceLogId: params.carMaintenanceLogId,
      depositAmount: Number(formState.depositAmount) || 0,
      depositType: formState.depositType,
    };
  };

  const handleSaveAndExit = () => {
    if (!validateBeforeSave()) {
      return;
    }

    setIsNavigating(true);
    createOrUpdateReceiptPayment(buildSubmitData(), {
      onSuccess: () => {
        if (isUpdateMode) {
          formContentRef.current?.refreshDetail();
        }
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

  useScreenHeader({
    title: isUpdateMode ? 'Sửa Thu Chi' : 'Tạo Thu Chi',
    onDelete: isUpdateMode ? handleDelete : undefined,
    isDeleting,
    onSave: handleSaveAndExit,
    isSaving,
  });

  return (
    <KeyboardAvoidingView style={styles.screenContainer} behavior={'padding'}>
      <ReceiptPaymentForm ref={formContentRef} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
});
