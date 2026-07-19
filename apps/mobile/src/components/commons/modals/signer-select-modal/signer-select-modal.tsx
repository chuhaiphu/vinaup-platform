import { useRef } from 'react';

import {
  ConfirmSlideSheet,
  ConfirmSlideSheetContentRef,
} from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { OrganizationMemberResponse } from '@/interfaces/organization-member-interfaces';
import { SignatureResponse } from '@/interfaces/signature-interfaces';

import { SignerSelectModalContent } from './signer-select-modal-content';

interface SignerSelectModalProps {
  organizationMembers?: OrganizationMemberResponse[] | null;
  receiverSignatures?: SignatureResponse[] | null;
  isLoading?: boolean;
  modalRef: React.RefObject<SlideSheetRef | null>;
  onConfirm?: (selectedOrganizationMemberIds: string[], closeModal: () => void) => void;
}

export function SignerSelectModal({
  organizationMembers,
  receiverSignatures,
  isLoading,
  modalRef,
  onConfirm,
}: SignerSelectModalProps) {
  const modalContentRef = useRef<ConfirmSlideSheetContentRef | null>(null);
  const closeModal = () => modalRef.current?.close();

  return (
    <ConfirmSlideSheet
      ref={modalRef}
      title="Chọn người ký tên"
      isLoading={isLoading}
      // Body is a MultiSelect that scrolls internally + fills the sheet; no outer scroll.
      scrollable={false}
      onConfirmPress={() => modalContentRef.current?.submit()}
    >
      <SignerSelectModalContent
        ref={modalContentRef}
        isLoading={isLoading}
        organizationMembers={organizationMembers}
        receiverSignatures={receiverSignatures}
        onSubmit={(ids) => onConfirm?.(ids, closeModal)}
      />
    </ConfirmSlideSheet>
  );
}
