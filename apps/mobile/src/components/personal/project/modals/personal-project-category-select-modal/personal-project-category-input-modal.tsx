import { useRef } from 'react';

import {
  ConfirmSlideSheet,
  ConfirmSlideSheetContentRef,
} from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { ProjectCategoryResponse } from '@/interfaces/project-interfaces';
import { usePersonalProjectCategoryContext } from '@/providers/personal/project/personal-project-category-provider';

import { PersonalProjectCategoryInputModalContent } from './personal-project-category-input-modal-content';

interface PersonalProjectCategoryInputModalProps {
  modalRef: React.RefObject<SlideSheetRef | null>;
  existingCategoryNames: string[];
  onCreated?: (category: ProjectCategoryResponse | null) => void;
}

export function PersonalProjectCategoryInputModal({
  modalRef,
  existingCategoryNames,
  onCreated,
}: PersonalProjectCategoryInputModalProps) {
  const modalContentRef = useRef<ConfirmSlideSheetContentRef | null>(null);
  const { createCategory, isCreating: isMutating } = usePersonalProjectCategoryContext();

  return (
    <ConfirmSlideSheet
      ref={modalRef}
      title="Thêm phân loại"
      isLoading={isMutating}
      onConfirmPress={() => modalContentRef.current?.submit()}
    >
      <PersonalProjectCategoryInputModalContent
        ref={modalContentRef}
        existingCategoryNames={existingCategoryNames}
        isLoading={isMutating}
        onSubmit={(name) => {
          createCategory(name, {
            onSuccess: (category) => {
              onCreated?.(category);
              modalRef.current?.close();
            },
          });
        }}
      />
    </ConfirmSlideSheet>
  );
}
