import { useRef } from 'react';

import { ConfirmSlideSheet } from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';

import { TourTaxInputModalContent, TourTaxInputRef } from './tour-tax-input-modal-content';

interface TourTaxModalProps {
  initialTaxRate?: number;
  isLoading?: boolean;
  modalRef: React.RefObject<SlideSheetRef | null>;
  onConfirm?: (taxRate: number, closeModal: () => void) => void;
}

export function TourTaxModal({
  initialTaxRate,
  isLoading,
  modalRef,
  onConfirm,
}: TourTaxModalProps) {
  const taxInputRef = useRef<TourTaxInputRef | null>(null);
  const closeModal = () => modalRef.current?.close();

  return (
    <ConfirmSlideSheet
      ref={modalRef}
      title="Thuế phải nộp"
      isLoading={isLoading}
      onOpenCompleted={() => taxInputRef.current?.focus()}
      onConfirmPress={() => taxInputRef.current?.submit()}
    >
      <TourTaxInputModalContent
        ref={taxInputRef}
        initialTaxRate={initialTaxRate}
        isLoading={isLoading}
        onSubmit={(taxRate) => onConfirm?.(taxRate, closeModal)}
      />
    </ConfirmSlideSheet>
  );
}
