import { useRef } from 'react';

import {
  ConfirmSlideSheet,
  ConfirmSlideSheetContentRef,
} from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';

import { TourTicketFormModalContent, TourTicketData } from './tour-ticket-form-modal-content';

interface TourTicketFormModalProps {
  initialData?: Partial<TourTicketData>;
  isLoading?: boolean;
  modalRef: React.RefObject<SlideSheetRef | null>;
  onConfirm?: (data: TourTicketData, closeModal: () => void) => void;
}

export function TourTicketFormModal({
  initialData,
  isLoading,
  modalRef,
  onConfirm,
}: TourTicketFormModalProps) {
  const modalContentRef = useRef<ConfirmSlideSheetContentRef | null>(null);
  const closeModal = () => modalRef.current?.close();

  return (
    <ConfirmSlideSheet
      ref={modalRef}
      title="Thông tin vé"
      isLoading={isLoading}
      onConfirmPress={() => modalContentRef.current?.submit()}
    >
      <TourTicketFormModalContent
        ref={modalContentRef}
        initialData={initialData}
        isLoading={isLoading}
        onSubmit={(data) => onConfirm?.(data, closeModal)}
      />
    </ConfirmSlideSheet>
  );
}
