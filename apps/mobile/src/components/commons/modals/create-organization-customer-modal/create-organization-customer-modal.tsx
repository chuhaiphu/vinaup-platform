import { useRef } from 'react';

import {
  ConfirmSlideSheet,
  ConfirmSlideSheetContentRef,
} from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { OrganizationCustomerResponse } from '@/interfaces/organization-customer-interfaces';
import { useOrganizationCustomerContext } from '@/providers/organization/customer/organization-customer-provider';

import { CreateOrganizationCustomerModalContent } from './create-organization-customer-modal-content';

interface CreateOrganizationCustomerModalProps {
  organizationId?: string;
  modalRef: React.RefObject<SlideSheetRef | null>;
  onCreated?: (customer: OrganizationCustomerResponse) => void;
}

export function CreateOrganizationCustomerModal({
  organizationId,
  modalRef,
  onCreated,
}: CreateOrganizationCustomerModalProps) {
  const modalContentRef = useRef<ConfirmSlideSheetContentRef | null>(null);
  const { isCreatingCustomer } = useOrganizationCustomerContext();
  const closeModal = () => modalRef.current?.close();

  return (
    <ConfirmSlideSheet
      ref={modalRef}
      title="Thêm khách hàng mới"
      isLoading={isCreatingCustomer}
      confirmText="Tạo khách hàng"
      heightPercentage={0.5}
      onConfirmPress={() => modalContentRef.current?.submit()}
    >
      <CreateOrganizationCustomerModalContent
        ref={modalContentRef}
        organizationId={organizationId}
        onCreated={(customer) => {
          onCreated?.(customer);
          closeModal();
        }}
      />
    </ConfirmSlideSheet>
  );
}
