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

interface ReceiptPaymentCategoryCreateModalProps {
  modalRef: React.RefObject<SlideSheetRef | null>;
  existingCategoryNames: string[];
  organizationId?: string;
  onCreated?: (category: ReceiptPaymentCategoryResponse | null) => void;
}

export function ReceiptPaymentCategoryCreateModal({
  modalRef,
  existingCategoryNames,
  onCreated,
}: Omit<ReceiptPaymentCategoryCreateModalProps, 'organizationId'>) {
  const inputRef = useRef<ReceiptPaymentCategoryInputRef>(null);
  const { createCategory, isCreating: isMutating } = useReceiptPaymentCategoryContext();

  return (
    <ConfirmSlideSheet
      ref={modalRef}
      title="Thêm phân loại"
      isLoading={isMutating}
      onOpenCompleted={() => inputRef.current?.focus()}
      onConfirmPress={() => inputRef.current?.submit()}
    >
      <ReceiptPaymentCategoryInput
        ref={inputRef}
        existingCategoryNames={existingCategoryNames}
        isLoading={isMutating}
        onSubmit={(name) => {
          createCategory(name, {
            onSuccess: (category) => {
              onCreated?.(category);
              modalRef.current?.close();
            },
            onError: (error: ApiError) => {
              Alert.alert('Lỗi', generateErrorMessage(error, 'Có lỗi xảy ra khi tạo phân loại.'));
            },
          });
        }}
      />
    </ConfirmSlideSheet>
  );
}
