import { useRef } from 'react';

import {
  ConfirmSlideSheet,
  ConfirmSlideSheetContentRef,
} from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { OrganizationMemberResponse } from '@/interfaces/organization-member-interfaces';
import { MemberAssignedTourImplementationResponse } from '@/interfaces/tour-implementation-interfaces';

import { OrgMemSelectModalContent } from './org-mem-select-modal-content';

interface OrgMemSelectModalProps {
  organizationMembers?: OrganizationMemberResponse[] | null;
  membersAssigned?: MemberAssignedTourImplementationResponse[] | null;
  isLoading?: boolean;
  modalRef: React.RefObject<SlideSheetRef | null>;
  onConfirm?: (selectedOrgMemberIds: string[], closeModal: () => void) => void;
}

export function OrgMemSelectModal({
  organizationMembers,
  membersAssigned,
  isLoading,
  modalRef,
  onConfirm,
}: OrgMemSelectModalProps) {
  const modalContentRef = useRef<ConfirmSlideSheetContentRef | null>(null);
  const closeModal = () => modalRef.current?.close();

  return (
    <ConfirmSlideSheet
      ref={modalRef}
      title="Điều hành"
      isLoading={isLoading}
      // Body is a MultiSelect that scrolls internally + fills the sheet; no outer scroll.
      scrollable={false}
      onConfirmPress={() => modalContentRef.current?.submit()}
    >
      <OrgMemSelectModalContent
        ref={modalContentRef}
        isLoading={isLoading}
        organizationMembers={organizationMembers}
        membersAssigned={membersAssigned}
        onSubmit={(ids) => onConfirm?.(ids, closeModal)}
      />
    </ConfirmSlideSheet>
  );
}
