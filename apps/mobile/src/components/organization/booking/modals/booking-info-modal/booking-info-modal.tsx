import { useRef } from 'react';

import {
  ConfirmSlideSheet,
  ConfirmSlideSheetContentRef,
} from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { BookingResponse } from '@/interfaces/booking-interfaces';

import { BookingInfoModalContent } from './booking-info-modal-content';

interface BookingInfoModalProps {
  booking: BookingResponse;
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

export function BookingInfoModal({
  booking,
  isLoading,
  modalRef,
  onConfirm,
}: BookingInfoModalProps) {
  const modalContentRef = useRef<ConfirmSlideSheetContentRef | null>(null);
  const closeModal = () => modalRef.current?.close();

  return (
    <ConfirmSlideSheet
      ref={modalRef}
      title="Chỉnh sửa thông tin"
      isLoading={isLoading}
      onConfirmPress={() => modalContentRef.current?.submit()}
    >
      <BookingInfoModalContent
        ref={modalContentRef}
        bookingDescription={booking.description}
        bookingCode={booking.code ?? undefined}
        bookingStartDate={booking.startDate}
        bookingEndDate={booking.endDate}
        bookingNote={booking.note}
        isLoading={isLoading}
        onSubmit={(data) => onConfirm?.(data, closeModal)}
      />
    </ConfirmSlideSheet>
  );
}
