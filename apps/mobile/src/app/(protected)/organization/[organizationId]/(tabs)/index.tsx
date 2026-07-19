import { useLocalSearchParams } from 'expo-router';

import { OrganizationIndexScreenContent } from '@/components/organization/screen-contents/organization-index-screen-content';
import { useInvoiceTypeContext } from '@/providers/organization/invoice/invoice-type-provider';
import { OrganizationHomeSummaryProvider } from '@/providers/organization/organization-home-summary-provider';

export default function OrganizationIndexScreen() {
  const { organizationId } = useLocalSearchParams<{ organizationId: string }>();
  const { getInvoiceTypeByCode } = useInvoiceTypeContext();
  return (
    <OrganizationHomeSummaryProvider
      organizationId={organizationId}
      sellInvoiceTypeId={getInvoiceTypeByCode('SELL')?.id}
    >
      <OrganizationIndexScreenContent organizationId={organizationId} />
    </OrganizationHomeSummaryProvider>
  );
}
