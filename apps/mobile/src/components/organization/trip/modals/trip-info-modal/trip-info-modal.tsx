import { useRef } from 'react';

import {
  ConfirmSlideSheet,
  ConfirmSlideSheetContentRef,
} from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { TripResponse } from '@/interfaces/trip-interfaces';

import { TripInfoModalContent } from './trip-info-modal-content';

interface TripInfoModalProps {
  trip: TripResponse;
  isLoading?: boolean;
  modalRef: React.RefObject<SlideSheetRef | null>;
  onConfirm?: (
    data: {
      description: string;
      startDate: string;
      endDate: string;
      code?: string;
      note?: string;
    },
    closeModal: () => void,
  ) => void;
}

export function TripInfoModal({ trip, isLoading, modalRef, onConfirm }: TripInfoModalProps) {
  const modalContentRef = useRef<ConfirmSlideSheetContentRef | null>(null);
  const closeModal = () => modalRef.current?.close();

  return (
    <ConfirmSlideSheet
      ref={modalRef}
      title="Chỉnh sửa thông tin"
      isLoading={isLoading}
      onConfirmPress={() => modalContentRef.current?.submit()}
    >
      <TripInfoModalContent
        ref={modalContentRef}
        tripDescription={trip.description}
        tripCode={trip.code ?? undefined}
        tripStartDate={trip.startDate}
        tripEndDate={trip.endDate}
        tripNote={trip.note}
        isLoading={isLoading}
        onSubmit={(data) => onConfirm?.(data, closeModal)}
      />
    </ConfirmSlideSheet>
  );
}
