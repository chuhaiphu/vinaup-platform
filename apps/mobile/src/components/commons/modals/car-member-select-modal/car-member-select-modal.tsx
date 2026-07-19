import { useRef } from 'react';

import {
  ConfirmSlideSheet,
  ConfirmSlideSheetContentRef,
} from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { OrganizationMemberResponse } from '@/interfaces/organization-member-interfaces';

import { CarMemberSelectModalContent } from './car-member-select-modal-content';

interface CarMemberSelectModalProps {
  organizationMembers?: OrganizationMemberResponse[] | null;
  preSelectedMemberIds?: string[];
  isLoading?: boolean;
  modalRef: React.RefObject<SlideSheetRef | null>;
  onConfirm?: (selectedOrganizationMemberIds: string[], closeModal: () => void) => void;
}

export function CarMemberSelectModal({
  organizationMembers,
  preSelectedMemberIds,
  isLoading,
  modalRef,
  onConfirm,
}: CarMemberSelectModalProps) {
  const modalContentRef = useRef<ConfirmSlideSheetContentRef | null>(null);
  const closeModal = () => modalRef.current?.close();

  return (
    <ConfirmSlideSheet
      ref={modalRef}
      title="Chọn tài xe"
      isLoading={isLoading}
      // Body is a MultiSelect that scrolls internally + fills the sheet; no outer scroll.
      scrollable={false}
      onConfirmPress={() => modalContentRef.current?.submit()}
    >
      <CarMemberSelectModalContent
        ref={modalContentRef}
        isLoading={isLoading}
        organizationMembers={organizationMembers}
        preSelectedMemberIds={preSelectedMemberIds}
        onSubmit={(ids) => onConfirm?.(ids, closeModal)}
      />
    </ConfirmSlideSheet>
  );
}
