import React from 'react';

import { OrgCustomerSelectModal } from '@/components/commons/modals/organization-customer-select-modal/org-customer-select-modal';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { useInvoiceDetailContext } from '@/providers/organization/invoice/invoice-detail-provider';

interface InvoiceOrgCustomerSelectModalProps {
  modalRef: React.RefObject<SlideSheetRef | null>;
}

export function InvoiceOrgCustomerSelectModal({ modalRef }: InvoiceOrgCustomerSelectModalProps) {
  const { invoice, isUpdatingInvoice, handleUpdateInvoice } = useInvoiceDetailContext();

  return (
    <OrgCustomerSelectModal
      modalRef={modalRef}
      organizationId={invoice?.organization?.id ?? ''}
      currentOrganizationCustomerId={invoice?.organizationCustomer?.id ?? ''}
      isBusy={isUpdatingInvoice}
      onConfirm={handleUpdateInvoice}
    />
  );
}
