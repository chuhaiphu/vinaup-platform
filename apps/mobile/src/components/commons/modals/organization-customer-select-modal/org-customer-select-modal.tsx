import React, { useRef } from 'react';

import {
  ConfirmSlideSheet,
  ConfirmSlideSheetContentRef,
} from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { useOrganizationCustomerContext } from '@/providers/organization/customer/organization-customer-provider';

import { OrgCustomerSelectModalContent } from './org-customer-select-modal-content';

export interface OrgCustomerSelectModalProps {
  modalRef: React.RefObject<SlideSheetRef | null>;
  organizationId: string;
  currentOrganizationCustomerId: string;
  isBusy: boolean;
  onConfirm: (payload: { organizationCustomerId: string | null }, callback: () => void) => void;
}

export function OrgCustomerSelectModal({
  modalRef,
  organizationId,
  currentOrganizationCustomerId,
  isBusy: isUpdating,
  onConfirm,
}: OrgCustomerSelectModalProps) {
  const { isCreatingCustomer } = useOrganizationCustomerContext();
  const modalContentRef = useRef<ConfirmSlideSheetContentRef | null>(null);

  const isBusy = isUpdating || isCreatingCustomer;

  return (
    // No `title`: the header row (title + "add customer" icon) is tab-conditional,
    // so the content owns it — keeps the tab state in one place (Composite Rule 5/6).
    <ConfirmSlideSheet
      ref={modalRef}
      isLoading={isBusy}
      confirmText="Chọn"
      // Body is a customer list that scrolls internally + fills the sheet; no outer scroll.
      scrollable={false}
      onConfirmPress={() => modalContentRef.current?.submit()}
    >
      <OrgCustomerSelectModalContent
        ref={modalContentRef}
        organizationId={organizationId}
        currentOrganizationCustomerId={currentOrganizationCustomerId}
        isBusy={isBusy}
        onConfirm={onConfirm}
        onRequestClose={() => modalRef.current?.close()}
      />
    </ConfirmSlideSheet>
  );
}
