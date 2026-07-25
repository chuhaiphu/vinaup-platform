import { useRef } from 'react';

import {
  ConfirmSlideSheet,
  ConfirmSlideSheetContentRef,
} from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';

import { PersonalProjectOrgCustomerModalContent } from './personal-project-org-customer-modal-content';

interface PersonalProjectOrgCustomerModalProps {
  modalRef: React.RefObject<SlideSheetRef | null>;
  organizationName?: string | null;
  customerName?: string | null;
  isLoading?: boolean;
  onConfirm?: (
    data: {
      // Both nullable: an emptied input clears the column, which only an explicit null can say.
      externalOrganizationName?: string | null;
      externalCustomerName?: string | null;
    },
    closeModal: () => void,
  ) => void;
}

export function PersonalProjectOrgCustomerModal({
  modalRef,
  organizationName,
  customerName,
  isLoading,
  onConfirm,
}: PersonalProjectOrgCustomerModalProps) {
  const modalContentRef = useRef<ConfirmSlideSheetContentRef | null>(null);
  const closeModal = () => modalRef.current?.close();

  return (
    <ConfirmSlideSheet
      ref={modalRef}
      title="Tổ chức & khách hàng"
      isLoading={isLoading}
      onConfirmPress={() => modalContentRef.current?.submit()}
    >
      <PersonalProjectOrgCustomerModalContent
        ref={modalContentRef}
        organizationName={organizationName}
        customerName={customerName}
        isLoading={isLoading}
        // Forwarded untouched: the content already emits null for an emptied input, and only that
        // null can clear the column — rewriting it to undefined would mean "leave unchanged".
        onSubmit={(data) => onConfirm?.(data, closeModal)}
      />
    </ConfirmSlideSheet>
  );
}
