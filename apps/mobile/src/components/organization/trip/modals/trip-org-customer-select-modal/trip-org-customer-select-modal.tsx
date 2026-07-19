import React from 'react';

import { OrgCustomerSelectModal } from '@/components/commons/modals/organization-customer-select-modal/org-customer-select-modal';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { useTripDetailContext } from '@/providers/organization/trip/trip-detail-provider';

interface TripOrgCustomerSelectModalProps {
  modalRef: React.RefObject<SlideSheetRef | null>;
}

export function TripOrgCustomerSelectModal({ modalRef }: TripOrgCustomerSelectModalProps) {
  const { trip, isUpdatingTrip, handleUpdateTrip } = useTripDetailContext();

  return (
    <OrgCustomerSelectModal
      modalRef={modalRef}
      organizationId={trip?.organization?.id ?? ''}
      currentOrganizationCustomerId={trip?.organizationCustomer?.id ?? ''}
      isBusy={isUpdatingTrip}
      onConfirm={handleUpdateTrip}
    />
  );
}
