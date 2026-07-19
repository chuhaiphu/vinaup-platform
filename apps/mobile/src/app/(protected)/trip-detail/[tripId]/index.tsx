import { useLocalSearchParams } from 'expo-router';
import { Suspense } from 'react';

import { EntityDetailSkeleton } from '@/components/commons/skeletons/entity-detail-skeleton';
import { TripDetailScreenContent } from '@/components/organization/trip/screen-contents/trip-detail-screen-content';
import { ErrorBoundary } from '@/components/primitives/error-boundary';
import { TripDetailProvider } from '@/providers/organization/trip/trip-detail-provider';

export default function TripDetailScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();

  return (
    <ErrorBoundary>
      <Suspense fallback={<EntityDetailSkeleton />}>
        <TripDetailProvider tripId={tripId}>
          <TripDetailScreenContent />
        </TripDetailProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
