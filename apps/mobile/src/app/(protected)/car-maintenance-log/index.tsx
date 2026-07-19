import { useLocalSearchParams } from 'expo-router';
import { Suspense } from 'react';

import { EntityListSectionSkeleton } from '@/components/commons/skeletons/entity-list-section-skeleton';
import { CarMaintenanceLogScreenContent } from '@/components/organization/car/screen-contents/car-maintenance-log-screen-content';
import { ErrorBoundary } from '@/components/primitives/error-boundary';
import { ReceiptPaymentCategoryProvider } from '@/providers/commons/receipt-payment/receipt-payment-category-provider';
import { OrganizationCarListProvider } from '@/providers/organization/car/organization-car-list-provider';

export default function CarMaintenanceLogScreen() {
  const { organizationId } = useLocalSearchParams<{ organizationId: string }>();

  return (
    <ErrorBoundary>
      <Suspense fallback={<EntityListSectionSkeleton />}>
        <OrganizationCarListProvider organizationId={organizationId}>
          <ReceiptPaymentCategoryProvider organizationId={organizationId}>
            <CarMaintenanceLogScreenContent />
          </ReceiptPaymentCategoryProvider>
        </OrganizationCarListProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
