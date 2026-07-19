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
      externalOrganizationName?: string;
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
        onSubmit={(data) =>
          onConfirm?.(
            {
              ...data,
              externalOrganizationName: data.externalOrganizationName ?? undefined,
              externalCustomerName: data.externalCustomerName ?? undefined,
            },
            closeModal,
          )
        }
      />
    </ConfirmSlideSheet>
  );
}
