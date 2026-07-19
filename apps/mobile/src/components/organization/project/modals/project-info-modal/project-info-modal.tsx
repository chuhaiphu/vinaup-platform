import { useRef } from 'react';

import {
  ConfirmSlideSheet,
  ConfirmSlideSheetContentRef,
} from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { ProjectResponse } from '@/interfaces/project-interfaces';

import { ProjectInfoModalContent } from './project-info-modal-content';

interface ProjectInfoModalProps {
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

export function ProjectInfoModal({
  project,
  isLoading,
  modalRef,
  onConfirm,
}: ProjectInfoModalProps) {
  const modalContentRef = useRef<ConfirmSlideSheetContentRef | null>(null);
  const closeModal = () => modalRef.current?.close();

  return (
    <ConfirmSlideSheet
      ref={modalRef}
      title="Chỉnh sửa thông tin"
      isLoading={isLoading}
      onConfirmPress={() => modalContentRef.current?.submit()}
    >
      <ProjectInfoModalContent
        ref={modalContentRef}
        prjCode={project.code ?? undefined}
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
