import { type ApiError } from 'fetchwire';
import { useRef } from 'react';
import { Alert } from 'react-native';

import { ConfirmSlideSheet } from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { ReceiptPaymentCategoryResponse } from '@/interfaces/receipt-payment-interfaces';
import { useReceiptPaymentCategoryContext } from '@/providers/commons/receipt-payment/receipt-payment-category-provider';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

import {
  ReceiptPaymentCategoryInput,
  ReceiptPaymentCategoryInputRef,
} from './receipt-payment-category-input';

interface ReceiptPaymentCategoryUpdateModalProps {
  currentCategory: ReceiptPaymentCategoryResponse | null;
  modalRef: React.RefObject<SlideSheetRef | null>;
  existingCategoryNames: string[];
  organizationId?: string;
  onUpdated?: (category: ReceiptPaymentCategoryResponse | null) => void;
}

export function ReceiptPaymentCategoryUpdateModal({
  currentCategory,
  modalRef,
  existingCategoryNames,
  onUpdated,
}: Omit<ReceiptPaymentCategoryUpdateModalProps, 'organizationId'>) {
  const inputRef = useRef<ReceiptPaymentCategoryInputRef>(null);
  const { updateCategory, isUpdating: isMutating } = useReceiptPaymentCategoryContext();

  return (
    <ConfirmSlideSheet
      ref={modalRef}
      title="Sửa phân loại"
      isLoading={isMutating}
      onOpenCompleted={() => inputRef.current?.focus()}
      onConfirmPress={() => inputRef.current?.submit()}
    >
      <ReceiptPaymentCategoryInput
        ref={inputRef}
        initialCategoryName={currentCategory?.name}
        existingCategoryNames={existingCategoryNames}
        isLoading={isMutating}
        onSubmit={(name) => {
          updateCategory(
            { id: currentCategory?.id || '', name },
            {
              onSuccess: (category) => {
                onUpdated?.(category);
                modalRef.current?.close();
              },
              onError: (error: ApiError) => {
                Alert.alert(
                  'Lỗi',
                  generateErrorMessage(error, 'Có lỗi xảy ra khi cập nhật phân loại.'),
                );
              },
            },
          );
        }}
      />
    </ConfirmSlideSheet>
  );
}
