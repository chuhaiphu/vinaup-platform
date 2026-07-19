import { useFetch } from 'fetchwire';
import { createContext, useContext } from 'react';

import { getAllOrganizations } from '@/apis/organization/organization-apis';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { OrganizationResponse } from '@/interfaces/organization-interfaces';

interface AllOrganizationsContextType {
  allOrganizations: OrganizationResponse[];
  isRefreshingAllOrganizations: boolean;
  refreshAllOrganizations: () => void;
}

const AllOrganizationsContext = createContext<AllOrganizationsContextType | null>(null);

export function useAllOrganizationsContext() {
  const ctx = useContext(AllOrganizationsContext);
  if (!ctx)
    throw new Error('useAllOrganizationsContext must be used within AllOrganizationsProvider');
  return ctx;
}

export function AllOrganizationsProvider({ children }: { children: React.ReactNode }) {
  const {
    data: allOrganizations,
    isRefreshing: isRefreshingAllOrganizations,
    refreshFetch: refreshAllOrganizations,
  } = useFetch(() => getAllOrganizations(), {
    fetchKey: 'all-organizations',
    tags: [FETCH_TAG.allOrganizationList],
  });

  return (
    <AllOrganizationsContext
      value={{
        allOrganizations: allOrganizations ?? [],
        isRefreshingAllOrganizations,
        refreshAllOrganizations,
      }}
    >
      {children}
    </AllOrganizationsContext>
  );
}
