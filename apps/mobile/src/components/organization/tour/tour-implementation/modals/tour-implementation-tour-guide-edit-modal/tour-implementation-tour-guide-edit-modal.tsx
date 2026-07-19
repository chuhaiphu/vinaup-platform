import { useRef } from 'react';

import {
  ConfirmSlideSheet,
  ConfirmSlideSheetContentRef,
} from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { TourImplementationAssignmentResponse } from '@/interfaces/tour-implementation-interfaces';

import {
  TourGuideEditFormData,
  TourImplementationTourGuideEditModalContent,
} from './tour-implementation-tour-guide-edit-modal-content';

interface TourImplementationTourGuideEditModalProps {
  modalRef: React.RefObject<SlideSheetRef | null>;
  tourImplementationAssignment: TourImplementationAssignmentResponse | null;
  organizationId: string;
  isLoading?: boolean;
  onConfirm?: (data: TourGuideEditFormData, closeModal: () => void) => void;
}

export function TourImplementationTourGuideEditModal({
  modalRef,
  tourImplementationAssignment,
  organizationId,
  isLoading,
  onConfirm,
}: TourImplementationTourGuideEditModalProps) {
  const modalContentRef = useRef<ConfirmSlideSheetContentRef | null>(null);
  const closeModal = () => modalRef.current?.close();

  return (
    <ConfirmSlideSheet
      ref={modalRef}
      title="Hướng dẫn viên"
      isLoading={isLoading}
      heightPercentage={0.6}
      scrollable={false}
      onConfirmPress={() => modalContentRef.current?.submit()}
    >
      {tourImplementationAssignment && (
        <TourImplementationTourGuideEditModalContent
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
