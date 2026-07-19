import { useFetchFn } from 'fetchwire';
import { createContext, useContext } from 'react';

import { getOrganizationMembersByOrganizationId } from '@/apis/organization/organization-member-apis';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { OrganizationMemberResponse } from '@/interfaces/organization-member-interfaces';

interface OrganizationMemberListContextType {
  organizationMembers: OrganizationMemberResponse[] | null | undefined;
  fetchMembers: () => void;
  isLoading: boolean;
}

const OrganizationMemberListContext = createContext<OrganizationMemberListContextType | null>(null);

export function useOrganizationMemberListContext() {
  const ctx = useContext(OrganizationMemberListContext);
  if (!ctx)
    throw new Error(
      'useOrganizationMemberListContext must be used within OrganizationMemberListProvider',
    );
  return ctx;
}

export function OrganizationMemberListProvider({
  organizationId,
  children,
}: {
  organizationId: string;
  children: React.ReactNode;
}) {
  const {
    data: organizationMembers,
    executeFetchFn: fetchMembers,
    isLoading,
  } = useFetchFn(() => getOrganizationMembersByOrganizationId(organizationId), {
    fetchKey: `organization-members-${organizationId}`,
    tags: [FETCH_TAG.memberList],
  });

  return (
    <OrganizationMemberListContext
      value={{
        organizationMembers,
        fetchMembers,
        isLoading: isLoading ?? false,
      }}
    >
      {children}
    </OrganizationMemberListContext>
  );
}
