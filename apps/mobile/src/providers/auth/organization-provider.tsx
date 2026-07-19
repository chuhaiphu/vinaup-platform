import { useFetch } from 'fetchwire';
import { createContext, useContext } from 'react';

import { getOrganizationsOfCurrentUser } from '@/apis/organization/organization-apis';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { OrganizationResponse } from '@/interfaces/organization-interfaces';

interface OrganizationContextType {
  organizations: OrganizationResponse[];
  isRefreshingOrganizations: boolean;
  refreshOrganizations: () => void;
}

const OrganizationContext = createContext<OrganizationContextType | null>(null);

export function useOrganizationContext() {
  const ctx = useContext(OrganizationContext);
  if (!ctx) throw new Error('useOrganizationContext must be used within OrganizationProvider');
  return ctx;
}

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const {
    data: organizations,
    isRefreshing: isRefreshingOrganizations,
    refreshFetch: refreshOrganizations,
  } = useFetch(() => getOrganizationsOfCurrentUser(), {
    fetchKey: 'organizations',
    tags: [FETCH_TAG.organizationList],
  });

  return (
    <OrganizationContext
      value={{
        organizations: organizations ?? [],
        isRefreshingOrganizations,
        refreshOrganizations,
      }}
    >
      {children}
    </OrganizationContext>
  );
}
