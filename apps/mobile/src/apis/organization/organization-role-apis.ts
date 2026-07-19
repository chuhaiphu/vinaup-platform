import { wireApi } from 'fetchwire';

import { OrganizationRoleResponse } from '@/interfaces/organization-role-interfaces';

export async function getOrganizationRolesByOrganizationId(organizationId: string) {
  return wireApi<OrganizationRoleResponse[]>(
    `/organization-role/by-organization/${organizationId}`,
    {
      method: 'GET',
    },
  );
}
