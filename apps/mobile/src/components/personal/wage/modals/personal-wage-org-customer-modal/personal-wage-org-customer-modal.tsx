import { useRef } from 'react';

import {
  ConfirmSlideSheet,
  ConfirmSlideSheetContentRef,
} from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { UpdateWageRequest } from '@/interfaces/wage-interfaces';

import { PersonalWageOrgCustomerModalContent } from './personal-wage-org-customer-modal-content';

interface PersonalWageOrgCustomerModalProps {
  modalRef: React.RefObject<SlideSheetRef | null>;
  organizationName?: string | null;
  customerName?: string | null;
  isLoading?: boolean;
  onConfirm?: (
    data: Pick<UpdateWageRequest, 'externalOrganizationName' | 'externalCustomerName'>,
    closeModal: () => void,
  ) => void;
}

export function PersonalWageOrgCustomerModal({
  modalRef,
  organizationName,
  customerName,
  isLoading,
  onConfirm,
}: PersonalWageOrgCustomerModalProps) {
  const modalContentRef = useRef<ConfirmSlideSheetContentRef | null>(null);
  const closeModal = () => modalRef.current?.close();

  return (
    <ConfirmSlideSheet
      ref={modalRef}
      title="Tổ chức & khách hàng"
      isLoading={isLoading}
      onConfirmPress={() => modalContentRef.current?.submit()}
    >
      <PersonalWageOrgCustomerModalContent
        ref={modalContentRef}
        organizationName={organizationName}
        customerName={customerName}
        isLoading={isLoading}
        onSubmit={(data) =>
          onConfirm?.(
            {
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
