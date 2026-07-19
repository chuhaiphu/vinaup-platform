import React from 'react';

import { OrgCustomerSelectModal } from '@/components/commons/modals/organization-customer-select-modal/org-customer-select-modal';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { useTourDetailContext } from '@/providers/organization/tour/tour-detail-provider';

interface TourOrgCustomerSelectModalProps {
  modalRef: React.RefObject<SlideSheetRef | null>;
}

export function TourOrgCustomerSelectModal({ modalRef }: TourOrgCustomerSelectModalProps) {
  const { tour, isUpdatingTour, handleUpdateTour } = useTourDetailContext();

  return (
    <OrgCustomerSelectModal
      modalRef={modalRef}
      organizationId={tour?.organization?.id ?? ''}
      currentOrganizationCustomerId={tour?.organizationCustomer?.id ?? ''}
      isBusy={isUpdatingTour}
      onConfirm={handleUpdateTour}
    />
  );
}
