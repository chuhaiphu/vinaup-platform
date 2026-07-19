import { useLocalSearchParams } from 'expo-router';
import { Suspense } from 'react';

import { EntityDetailSkeleton } from '@/components/commons/skeletons/entity-detail-skeleton';
import { CarDetailScreenContent } from '@/components/organization/car/screen-contents/car-detail-screen-content';
import { ErrorBoundary } from '@/components/primitives/error-boundary';
import { FuelPriceProvider } from '@/providers/commons/fuel-price-provider';
import { CarDetailProvider } from '@/providers/organization/car/car-detail-provider';

export default function CarDetailScreen() {
  const { carId } = useLocalSearchParams<{ carId: string }>();

  return (
    <ErrorBoundary>
      <Suspense fallback={<EntityDetailSkeleton />}>
        <CarDetailProvider carId={carId}>
          <FuelPriceProvider>
            <CarDetailScreenContent />
          </FuelPriceProvider>
        </CarDetailProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
