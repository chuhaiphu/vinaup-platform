import { useLocalSearchParams } from 'expo-router';
import { Suspense } from 'react';

import { EntityDetailSkeleton } from '@/components/commons/skeletons/entity-detail-skeleton';
import { PersonalWageDetailScreenContent } from '@/components/personal/wage/screen-contents/personal-wage-detail-screen-content';
import { ErrorBoundary } from '@/components/primitives/error-boundary';
import { PersonalWageDetailProvider } from '@/providers/personal/wage/personal-wage-detail-provider';

export default function WageDetailScreen() {
  const { wageId } = useLocalSearchParams<{ wageId: string }>();

  return (
    <ErrorBoundary>
      <Suspense fallback={<EntityDetailSkeleton />}>
        <PersonalWageDetailProvider wageId={wageId}>
          <PersonalWageDetailScreenContent />
        </PersonalWageDetailProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
