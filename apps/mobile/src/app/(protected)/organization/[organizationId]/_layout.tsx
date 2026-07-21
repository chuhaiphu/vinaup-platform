import { Slot, useLocalSearchParams } from 'expo-router';
import { Suspense } from 'react';

import { IndexShellSkeleton } from '@/components/commons/skeletons/index-shell-skeleton';
import { InvoiceTypeProvider } from '@/providers/organization/invoice/invoice-type-provider';
import { OrganizationAbilityProvider } from '@/providers/organization/organization-ability-provider';

export default function OrganizationLayout() {
  const { organizationId } = useLocalSearchParams<{ organizationId: string }>();

  return (
    <Suspense fallback={<IndexShellSkeleton />}>
      <OrganizationAbilityProvider organizationId={organizationId}>
        <InvoiceTypeProvider>
          <Slot />
        </InvoiceTypeProvider>
      </OrganizationAbilityProvider>
    </Suspense>
  );
}
