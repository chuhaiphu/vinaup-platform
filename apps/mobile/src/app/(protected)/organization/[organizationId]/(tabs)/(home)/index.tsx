import { OrganizationIndexScreenContent } from '@/components/organization/screen-contents/organization-index-screen-content';
import { useOrganizationAbility } from '@/providers/organization/organization-ability-provider';
import { OrganizationHomeSummaryProvider } from '@/providers/organization/organization-home-summary-provider';

export default function OrganizationIndexScreen() {
  const { organizationId } = useOrganizationAbility();
  return (
    <OrganizationHomeSummaryProvider organizationId={organizationId}>
      <OrganizationIndexScreenContent organizationId={organizationId} />
    </OrganizationHomeSummaryProvider>
  );
}
