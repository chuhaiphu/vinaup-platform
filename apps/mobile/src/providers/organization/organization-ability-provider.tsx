import {
  getUserAbility,
  type PermissionAction,
  type PermissionResource,
} from '@vinaup-platform/permission';
import { useFetch } from 'fetchwire';
import { createContext, useContext, useMemo } from 'react';

import { getMyAbilityInOrganization } from '@/apis/organization/organization-apis';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';

interface OrganizationAbilityContextType {
  can: (action: PermissionAction, resource: PermissionResource) => boolean;
  isOwner: boolean;
  roleCode: string;
}

const OrganizationAbilityContext = createContext<OrganizationAbilityContextType | null>(null);

export function useOrganizationAbility() {
  const ctx = useContext(OrganizationAbilityContext);
  if (!ctx)
    throw new Error('useOrganizationAbility must be used within OrganizationAbilityProvider');
  return ctx;
}

export function OrganizationAbilityProvider({
  organizationId,
  children,
}: {
  organizationId: string;
  children: React.ReactNode;
}) {
  const { data: organizationAbility } = useFetch(() => getMyAbilityInOrganization(organizationId), {
    fetchKey: `organization-ability-${organizationId}`,
    tags: [FETCH_TAG.organizationAbilityByOrganizationId(organizationId)],
  });

  const userAbility = useMemo(
    () => getUserAbility(organizationAbility?.permissions ?? []),
    [organizationAbility],
  );

  if (!organizationAbility) return null;

  const value: OrganizationAbilityContextType = {
    can: (action, resource) => userAbility.can(action, resource),
    isOwner: organizationAbility.isOwner,
    roleCode: organizationAbility.roleCode,
  };

  return <OrganizationAbilityContext value={value}>{children}</OrganizationAbilityContext>;
}
