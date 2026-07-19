import { useRef } from 'react';

import {
  ConfirmSlideSheet,
  ConfirmSlideSheetContentRef,
} from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { ReceiptPaymentDepositType } from '@/constants/receipt-payment-constants';

import { DepositInputModalContent, DepositInputValue } from './deposit-input-modal-content';

interface DepositInputModalProps {
  modalRef: React.RefObject<SlideSheetRef | null>;
  amount?: string;
  depositType?: ReceiptPaymentDepositType;
  onConfirm?: (value: DepositInputValue) => void;
}

export function DepositInputModal({
  modalRef,
  amount,
  depositType,
  onConfirm,
}: DepositInputModalProps) {
  const modalContentRef = useRef<ConfirmSlideSheetContentRef | null>(null);
  const closeModal = () => modalRef.current?.close();

  return (
    <ConfirmSlideSheet
      ref={modalRef}
      title="Đặt cọc"
      onConfirmPress={() => modalContentRef.current?.submit()}
    >
      <DepositInputModalContent
        ref={modalContentRef}
        amount={amount}
        depositType={depositType}
        onSubmit={(value) => {
          onConfirm?.(value);
          closeModal();
        }}
      />
    </ConfirmSlideSheet>
  );
}
