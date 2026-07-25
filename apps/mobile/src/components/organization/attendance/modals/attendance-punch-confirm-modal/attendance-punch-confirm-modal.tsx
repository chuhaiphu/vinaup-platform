import { useRef } from 'react';

import {
  ConfirmSlideSheet,
  ConfirmSlideSheetContentRef,
} from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import {
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

  return (
    <ConfirmSlideSheet
      ref={modalRef}
      title={AttendancePunchActionDisplay[punchAction]}
      isLoading={isLoading}
      onConfirmPress={() => modalContentRef.current?.submit()}
    >
      <AttendancePunchConfirmModalContent
        ref={modalContentRef}
        organizationId={organizationId}
        punchAction={punchAction}
        attendanceMode={attendanceMode}
        isLoading={isLoading}
        onSubmit={(value) => onConfirm?.(value, closeModal)}
      />
    </ConfirmSlideSheet>
  );
}
