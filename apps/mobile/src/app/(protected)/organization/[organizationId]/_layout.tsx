import { Slot, useLocalSearchParams } from 'expo-router';
import { Suspense } from 'react';

import { IndexShellSkeleton } from '@/components/commons/skeletons/index-shell-skeleton';
import { OrganizationAbilityProvider } from '@/providers/organization/organization-ability-provider';

export default function OrganizationLayout() {
  const { organizationId } = useLocalSearchParams<{ organizationId: string }>();

  return (
    <Suspense fallback={<IndexShellSkeleton />}>
      <OrganizationAbilityProvider organizationId={organizationId}>
        <Slot />
      </OrganizationAbilityProvider>
    </Suspense>
  );
}
