import { useRef } from 'react';

import {
  ConfirmSlideSheet,
  ConfirmSlideSheetContentRef,
} from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import {
  ATTENDANCE_PUNCH_ACTION,
  AttendanceMode,
  AttendancePunchAction,
  AttendancePunchActionDisplay,
} from '@/constants/attendance-constants';

import {
  AttendancePunchConfirmModalContent,
  AttendancePunchSubmitValue,
} from './attendance-punch-confirm-modal-content';

interface AttendancePunchConfirmModalProps {
  organizationId: string;
  punchAction: AttendancePunchAction;
  attendanceMode: AttendanceMode;
  isLoading?: boolean;
  modalRef: React.RefObject<SlideSheetRef | null>;
  onConfirm?: (value: AttendancePunchSubmitValue, closeModal: () => void) => void;
}

export function AttendancePunchConfirmModal({
  organizationId,
  punchAction,
  attendanceMode,
  isLoading,
  modalRef,
  onConfirm,
}: AttendancePunchConfirmModalProps) {
  const modalContentRef = useRef<ConfirmSlideSheetContentRef | null>(null);
  const closeModal = () => modalRef.current?.close();

  // Check-out carries no form at all: the open session already holds the location and note typed at
  // check-in, and submitting the fields empty would overwrite them with nothing.
  const isCheckOut = punchAction === ATTENDANCE_PUNCH_ACTION.CHECK_OUT;

  const handleConfirmPress = () => {
    if (isCheckOut) {
      onConfirm?.(
        { punchAction: ATTENDANCE_PUNCH_ACTION.CHECK_OUT, request: { organizationId } },
        closeModal,
      );
      return;
    }
    modalContentRef.current?.submit();
  };

  return (
    <ConfirmSlideSheet
      ref={modalRef}
      title={AttendancePunchActionDisplay[punchAction]}
      isLoading={isLoading}
      onConfirmPress={handleConfirmPress}
    >
      {!isCheckOut && (
        <AttendancePunchConfirmModalContent
          ref={modalContentRef}
          organizationId={organizationId}
          attendanceMode={attendanceMode}
          isLoading={isLoading}
          onSubmit={(value) => onConfirm?.(value, closeModal)}
        />
      )}
    </ConfirmSlideSheet>
  );
}
