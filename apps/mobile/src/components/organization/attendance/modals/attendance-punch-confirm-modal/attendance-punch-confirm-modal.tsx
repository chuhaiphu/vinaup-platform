import { useRef, useState } from 'react';

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
import { useCurrentLocation } from '@/hooks/use-current-location';

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

  const [isSheetSettled, setIsSheetSettled] = useState(false);

  const isCheckOut = punchAction === ATTENDANCE_PUNCH_ACTION.CHECK_OUT;

  const currentLocationState = useCurrentLocation({ enabled: !isCheckOut && isSheetSettled });

  const isLocationLoading = !isCheckOut && (!isSheetSettled || currentLocationState.isLoading);

  const handleConfirmPress = () => modalContentRef.current?.submit();

  return (
    <ConfirmSlideSheet
      ref={modalRef}
      title={AttendancePunchActionDisplay[punchAction]}
      isLoading={isLoading}
      confirmDisabled={isLocationLoading}
      onConfirmPress={handleConfirmPress}
      onOpenCompleted={() => setIsSheetSettled(true)}
      onCloseCompleted={() => setIsSheetSettled(false)}
    >
      <AttendancePunchConfirmModalContent
        ref={modalContentRef}
        organizationId={organizationId}
        punchAction={punchAction}
        attendanceMode={attendanceMode}
        isLoading={isLoading}
        currentLocationState={currentLocationState}
        isLocationLoading={isLocationLoading}
        onSubmit={(value) => onConfirm?.(value, closeModal)}
      />
    </ConfirmSlideSheet>
  );
}
