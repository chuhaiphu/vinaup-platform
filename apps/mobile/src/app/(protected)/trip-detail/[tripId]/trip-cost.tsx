import { useLocalSearchParams } from 'expo-router';
import { Suspense } from 'react';

import { EntityDetailSkeleton } from '@/components/commons/skeletons/entity-detail-skeleton';
import { TripCostScreenContent } from '@/components/organization/trip/trip-expense/screen-contents/trip-expense-screen-content';
import { ErrorBoundary } from '@/components/primitives/error-boundary';
import { ReceiptPaymentListInTripProvider } from '@/providers/commons/receipt-payment/receipt-payment-list-in-trip-provider';
import { TripDetailProvider } from '@/providers/organization/trip/trip-detail-provider';

export default function TripCostScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();

  return (
    <ErrorBoundary>
      <Suspense fallback={<EntityDetailSkeleton />}>
        <TripDetailProvider tripId={tripId}>
          <ReceiptPaymentListInTripProvider tripId={tripId}>
            <TripCostScreenContent />
          </ReceiptPaymentListInTripProvider>
        </TripDetailProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
