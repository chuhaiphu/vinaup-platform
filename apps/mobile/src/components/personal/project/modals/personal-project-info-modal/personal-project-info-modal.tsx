import { useRef } from 'react';

import {
  ConfirmSlideSheet,
  ConfirmSlideSheetContentRef,
} from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { ProjectResponse } from '@/interfaces/project-interfaces';

import { PersonalProjectInfoModalContent } from './personal-project-info-modal-content';

interface PersonalProjectInfoModalProps {
  project: ProjectResponse;
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

export function PersonalProjectInfoModal({
  project,
  isLoading,
  modalRef,
  onConfirm,
}: PersonalProjectInfoModalProps) {
  const modalContentRef = useRef<ConfirmSlideSheetContentRef | null>(null);
  const closeModal = () => modalRef.current?.close();

  return (
    <ConfirmSlideSheet
      ref={modalRef}
      title="Chỉnh sửa thông tin"
      isLoading={isLoading}
      onConfirmPress={() => modalContentRef.current?.submit()}
    >
      <PersonalProjectInfoModalContent
        ref={modalContentRef}
        projectCategory={project.category}
        prjCode={project.code}
        prjDescription={project.description}
        prjStartDate={project.startDate}
        prjEndDate={project.endDate}
        prjNote={project.note}
        isLoading={isLoading}
        onSubmit={(data) => onConfirm?.(data, closeModal)}
      />
    </ConfirmSlideSheet>
  );
}
