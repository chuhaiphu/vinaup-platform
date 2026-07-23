import { useLocalSearchParams } from 'expo-router';
import { Suspense } from 'react';

import { EntityDetailSkeleton } from '@/components/commons/skeletons/entity-detail-skeleton';
import { InvoiceDetailScreenContent } from '@/components/organization/invoice/screen-contents/invoice-detail-screen-content';
import { ErrorBoundary } from '@/components/primitives/error-boundary';
import { InvoiceDetailProvider } from '@/providers/organization/invoice/invoice-detail-provider';

export default function InvoiceDetailScreen() {
  const { invoiceId } = useLocalSearchParams<{ invoiceId: string }>();

  return (
    <ErrorBoundary>
      <Suspense fallback={<EntityDetailSkeleton />}>
        <InvoiceDetailProvider invoiceId={invoiceId}>
          <InvoiceDetailScreenContent />
        </InvoiceDetailProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
