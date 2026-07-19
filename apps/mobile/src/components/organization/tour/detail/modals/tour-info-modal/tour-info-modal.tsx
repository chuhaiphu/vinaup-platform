import { useRef } from 'react';

import {
  ConfirmSlideSheet,
  ConfirmSlideSheetContentRef,
} from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { TourResponse } from '@/interfaces/tour-interfaces';

import { TourInfoModalContent } from './tour-info-modal-content';

interface TourInfoModalProps {
  tour: TourResponse;
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

export function TourInfoModal({ tour, isLoading, modalRef, onConfirm }: TourInfoModalProps) {
  const modalContentRef = useRef<ConfirmSlideSheetContentRef | null>(null);
  const closeModal = () => modalRef.current?.close();

  return (
    <ConfirmSlideSheet
      ref={modalRef}
      title="Chỉnh sửa thông tin"
      isLoading={isLoading}
      onConfirmPress={() => modalContentRef.current?.submit()}
    >
      <TourInfoModalContent
        ref={modalContentRef}
        tourDescription={tour.description}
        tourCode={tour.code ?? undefined}
        tourStartDate={tour.startDate}
        tourEndDate={tour.endDate}
        tourNote={tour.note}
        isLoading={isLoading}
        onSubmit={(data) => onConfirm?.(data, closeModal)}
      />
    </ConfirmSlideSheet>
  );
}
