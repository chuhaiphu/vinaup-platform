import { useRef } from 'react';

import {
  ConfirmSlideSheet,
  ConfirmSlideSheetContentRef,
} from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { AttendanceConclusionResponse } from '@/interfaces/attendance-interfaces';

import {
  AttendanceConclusionModalContent,
  AttendanceConclusionSubmitValue,
} from './attendance-conclusion-modal-content';

interface AttendanceConclusionModalProps {
  modalRef: React.RefObject<SlideSheetRef | null>;
  attendanceConclusion: AttendanceConclusionResponse | null;
  isLoading?: boolean;
  onConfirm?: (value: AttendanceConclusionSubmitValue, closeModal: () => void) => void;
}

export function AttendanceConclusionModal({
  modalRef,
  attendanceConclusion,
  isLoading,
  onConfirm,
}: AttendanceConclusionModalProps) {
  const modalContentRef = useRef<ConfirmSlideSheetContentRef | null>(null);
  const closeModal = () => modalRef.current?.close();

  return (
    <ConfirmSlideSheet
      ref={modalRef}
      title="Kết luận chấm công"
      isLoading={isLoading}
      onConfirmPress={() => modalContentRef.current?.submit()}
    >
      <AttendanceConclusionModalContent
        ref={modalContentRef}
        attendanceConclusion={attendanceConclusion}
        isLoading={isLoading}
        onSubmit={(value) => onConfirm?.(value, closeModal)}
      />
    </ConfirmSlideSheet>
  );
}
