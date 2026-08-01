import { useLocalSearchParams } from 'expo-router';
import { Suspense } from 'react';

import { EntityListSectionSkeleton } from '@/components/commons/skeletons/entity-list-section-skeleton';
import { AttendanceMemberDetailScreenContent } from '@/components/organization/attendance/screen-contents/attendance-member-detail-screen-content';
import { ErrorBoundary } from '@/components/primitives/error-boundary';
import { OrganizationAbilityProvider } from '@/providers/organization/organization-ability-provider';

export default function AttendanceMemberDetailScreen() {
  const { organizationId } = useLocalSearchParams<{ organizationId: string }>();

  return (
    <ErrorBoundary>
      <Suspense fallback={<EntityListSectionSkeleton />}>
        <OrganizationAbilityProvider organizationId={organizationId}>
          <AttendanceMemberDetailScreenContent />
        </OrganizationAbilityProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
