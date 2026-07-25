import { useRef } from 'react';

import {
  ConfirmSlideSheet,
  ConfirmSlideSheetContentRef,
} from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { InvoiceResponse } from '@/interfaces/invoice-interfaces';

import { InvoiceInfoModalContent } from './invoice-info-modal-content';

interface InvoiceInfoModalProps {
  invoice: InvoiceResponse;
  isLoading?: boolean;
  modalRef: React.RefObject<SlideSheetRef | null>;
  onConfirm?: (
    data: {
      description: string;
      startDate: string;
      endDate: string;
      // Nullable: an emptied input clears the column, and only an explicit null says that.
      code?: string | null;
      note?: string | null;
    },
    closeModal: () => void,
  ) => void;
}

export function InvoiceInfoModal({
  invoice,
  isLoading,
  modalRef,
  onConfirm,
}: InvoiceInfoModalProps) {
  const modalContentRef = useRef<ConfirmSlideSheetContentRef | null>(null);
  const closeModal = () => modalRef.current?.close();

  return (
    <ConfirmSlideSheet
      ref={modalRef}
      title="Chỉnh sửa thông tin"
      isLoading={isLoading}
      onConfirmPress={() => modalContentRef.current?.submit()}
    >
      <InvoiceInfoModalContent
        ref={modalContentRef}
        invCode={invoice.code ?? undefined}
        invDescription={invoice.description}
        invStartDate={invoice.startDate}
        invNote={invoice.note}
        isLoading={isLoading}
        onSubmit={(data) => onConfirm?.(data, closeModal)}
      />
    </ConfirmSlideSheet>
  );
}
