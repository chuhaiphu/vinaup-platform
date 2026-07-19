import { SlideSheet, SlideSheetRef } from '@/components/primitives/slide-sheet';
import { ProjectCategoryResponse } from '@/interfaces/project-interfaces';

import { PersonalProjectCategorySelectModalContent } from './personal-project-category-select-modal-content';

interface PersonalProjectCategorySelectModalProps {
  modalRef: React.RefObject<SlideSheetRef | null>;
  selectedCategoryId?: string | null;
  onSelect?: (category: ProjectCategoryResponse | null) => void;
}

export function PersonalProjectCategorySelectModal({
  modalRef,
  selectedCategoryId,
  onSelect,
}: PersonalProjectCategorySelectModalProps) {
  return (
    <SlideSheet ref={modalRef}>
      <PersonalProjectCategorySelectModalContent
        selectedCategoryId={selectedCategoryId}
        onSelect={(category) => {
          onSelect?.(category);
          modalRef.current?.close();
        }}
        onCloseRequest={() => modalRef.current?.close()}
      />
    </SlideSheet>
  );
}
