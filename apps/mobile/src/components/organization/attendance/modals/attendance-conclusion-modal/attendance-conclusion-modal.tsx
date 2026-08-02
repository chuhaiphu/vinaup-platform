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
  /** Who the verdict is about — absent only when the screen was reached without the member's name. */
  organizationMemberName?: string;
  attendanceConclusion: AttendanceConclusionResponse | null;
  totalText: string;
  isLoading?: boolean;
  onConfirm?: (value: AttendanceConclusionSubmitValue, closeModal: () => void) => void;
}

export function AttendanceConclusionModal({
  modalRef,
  organizationMemberName,
  attendanceConclusion,
  totalText,
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
        organizationMemberName={organizationMemberName}
        attendanceConclusion={attendanceConclusion}
        totalText={totalText}
        isLoading={isLoading}
        onSubmit={(value) => onConfirm?.(value, closeModal)}
      />
    </ConfirmSlideSheet>
  );
}
