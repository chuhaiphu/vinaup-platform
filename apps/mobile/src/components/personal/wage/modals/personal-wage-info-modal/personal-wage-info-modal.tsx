import { useRef } from 'react';

import {
  ConfirmSlideSheet,
  ConfirmSlideSheetContentRef,
} from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { WageResponse } from '@/interfaces/wage-interfaces';

import { PersonalWageInfoModalContent } from './personal-wage-info-modal-content';

interface PersonalWageInfoModalProps {
  wage: WageResponse;
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

export function PersonalWageInfoModal({
  wage,
  isLoading,
  modalRef,
  onConfirm,
}: PersonalWageInfoModalProps) {
  const modalContentRef = useRef<ConfirmSlideSheetContentRef | null>(null);
  const closeModal = () => modalRef.current?.close();

  return (
    <ConfirmSlideSheet
      ref={modalRef}
      title="Chỉnh sửa thông tin"
      isLoading={isLoading}
      onConfirmPress={() => modalContentRef.current?.submit()}
    >
      <PersonalWageInfoModalContent
        ref={modalContentRef}
        wageCode={wage.code}
        wageDescription={wage.description}
        wageStartDate={wage.startDate}
        wageEndDate={wage.endDate}
        wageNote={wage.note}
        isLoading={isLoading}
        onSubmit={(data) => onConfirm?.(data, closeModal)}
      />
    </ConfirmSlideSheet>
  );
}
