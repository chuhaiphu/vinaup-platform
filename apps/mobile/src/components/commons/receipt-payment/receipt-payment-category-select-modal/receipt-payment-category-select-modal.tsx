import { SlideSheet, SlideSheetRef } from '@/components/primitives/slide-sheet';
import { ReceiptPaymentCategoryResponse } from '@/interfaces/receipt-payment-interfaces';

import { ReceiptPaymentCategorySelectModalContent } from './receipt-payment-category-select-modal-content';

interface ReceiptPaymentCategorySelectModalProps {
  modalRef: React.RefObject<SlideSheetRef | null>;
  selectedCategoryId?: string | null;
  organizationId?: string;
  onSelect?: (category: ReceiptPaymentCategoryResponse | null) => void;
}

export function ReceiptPaymentCategorySelectModal({
  modalRef,
  selectedCategoryId,
  organizationId,
  onSelect,
}: ReceiptPaymentCategorySelectModalProps) {
  return (
    <SlideSheet ref={modalRef}>
      <ReceiptPaymentCategorySelectModalContent
        selectedCategoryId={selectedCategoryId}
        organizationId={organizationId}
        onSelectAndClose={(category) => {
          onSelect?.(category);
          modalRef.current?.close();
        }}
        onCategoryUpdated={(category) => {
          onSelect?.(category);
        }}
        onCategoryDeleted={() => {
          onSelect?.(null);
        }}
        onCloseRequest={() => modalRef.current?.close()}
      />
    </SlideSheet>
  );
}
