import { useLocalSearchParams } from 'expo-router';
import { Suspense } from 'react';

import { EntityListSectionSkeleton } from '@/components/commons/skeletons/entity-list-section-skeleton';
import { AttendanceManagementScreenContent } from '@/components/organization/attendance/screen-contents/attendance-management-screen-content';
import { ErrorBoundary } from '@/components/primitives/error-boundary';
import { OrganizationAbilityProvider } from '@/providers/organization/organization-ability-provider';

export default function AttendanceManagementScreen() {
  const { organizationId } = useLocalSearchParams<{ organizationId: string }>();

  return (
    <ErrorBoundary>
      <Suspense fallback={<EntityListSectionSkeleton />}>
        <OrganizationAbilityProvider organizationId={organizationId}>
          <AttendanceManagementScreenContent />
        </OrganizationAbilityProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
