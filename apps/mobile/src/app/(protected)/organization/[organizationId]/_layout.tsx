import { Slot } from 'expo-router';
import { Suspense } from 'react';

import { IndexShellSkeleton } from '@/components/commons/skeletons/index-shell-skeleton';
import { InvoiceTypeProvider } from '@/providers/organization/invoice/invoice-type-provider';

export default function OrganizationLayout() {
  return (
    <Suspense fallback={<IndexShellSkeleton />}>
      <InvoiceTypeProvider>
        <Slot />
      </InvoiceTypeProvider>
    </Suspense>
  );
}
