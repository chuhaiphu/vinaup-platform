import { useRef } from 'react';

import {
  ConfirmSlideSheet,
  ConfirmSlideSheetContentRef,
} from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { TourImplementationAssignmentResponse } from '@/interfaces/tour-implementation-interfaces';

import {
  DriverCarEditFormData,
  TourImplementationDriverCarEditModalContent,
} from './tour-implementation-driver-car-edit-modal-content';

interface Props {
  modalRef: React.RefObject<SlideSheetRef | null>;
  tourImplementationAssignment: TourImplementationAssignmentResponse | null;
  organizationId: string;
  isLoading?: boolean;
  onConfirm?: (data: DriverCarEditFormData, closeModal: () => void) => void;
}

export function TourImplementationDriverCarEditModal({
  modalRef,
  tourImplementationAssignment,
  organizationId,
  isLoading,
  onConfirm,
}: Props) {
  const modalContentRef = useRef<ConfirmSlideSheetContentRef | null>(null);
  const closeModal = () => modalRef.current?.close();

  return (
    <ConfirmSlideSheet
      ref={modalRef}
      isLoading={isLoading}
      heightPercentage={0.6}
      scrollable={false}
      onConfirmPress={() => modalContentRef.current?.submit()}
    >
      {tourImplementationAssignment && (
        <TourImplementationDriverCarEditModalContent
          ref={modalContentRef}
          tourImplementationAssignment={tourImplementationAssignment}
          organizationId={organizationId}
          isLoading={isLoading}
          onSubmit={(data) => onConfirm?.(data, closeModal)}
        />
      )}
    </ConfirmSlideSheet>
  );
}
