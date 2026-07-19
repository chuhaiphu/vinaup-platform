import { useLocalSearchParams } from 'expo-router';
import { Suspense } from 'react';

import { EntityDetailSkeleton } from '@/components/commons/skeletons/entity-detail-skeleton';
import { BookingDetailScreenContent } from '@/components/organization/booking/screen-contents/booking-detail-screen-content';
import { ErrorBoundary } from '@/components/primitives/error-boundary';
import { BookingDetailProvider } from '@/providers/organization/booking/booking-detail-provider';

export default function BookingDetailScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();

  return (
    <ErrorBoundary>
      <Suspense fallback={<EntityDetailSkeleton />}>
        <BookingDetailProvider bookingId={bookingId}>
          <BookingDetailScreenContent />
        </BookingDetailProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
