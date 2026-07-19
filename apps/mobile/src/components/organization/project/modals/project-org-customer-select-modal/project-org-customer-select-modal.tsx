import React from 'react';

import { OrgCustomerSelectModal } from '@/components/commons/modals/organization-customer-select-modal/org-customer-select-modal';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { useProjectDetailContext } from '@/providers/organization/project/project-detail-provider';

interface ProjectOrgCustomerSelectModalProps {
  modalRef: React.RefObject<SlideSheetRef | null>;
}

export function ProjectOrgCustomerSelectModal({ modalRef }: ProjectOrgCustomerSelectModalProps) {
  const { project, isUpdatingProject, handleUpdateProject } = useProjectDetailContext();

  return (
    <OrgCustomerSelectModal
      modalRef={modalRef}
      organizationId={project?.organization?.id ?? ''}
      currentOrganizationCustomerId={project?.organizationCustomer?.id ?? ''}
      isBusy={isUpdatingProject}
      onConfirm={handleUpdateProject}
    />
  );
}
