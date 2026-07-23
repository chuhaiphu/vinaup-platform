import { useLocalSearchParams } from 'expo-router';

import { OrganizationIndexScreenContent } from '@/components/organization/screen-contents/organization-index-screen-content';
import { OrganizationHomeSummaryProvider } from '@/providers/organization/organization-home-summary-provider';

export default function OrganizationIndexScreen() {
  const { organizationId } = useLocalSearchParams<{ organizationId: string }>();
  return (
    <OrganizationHomeSummaryProvider organizationId={organizationId}>
      <OrganizationIndexScreenContent organizationId={organizationId} />
    </OrganizationHomeSummaryProvider>
  );
}
