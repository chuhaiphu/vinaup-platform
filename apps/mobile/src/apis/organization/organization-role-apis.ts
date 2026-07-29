import { wireData } from 'fetchwire';

import { OrganizationRoleResponse } from '@/interfaces/organization-role-interfaces';

export async function getOrganizationRolesByOrganizationId(organizationId: string) {
  return wireData<OrganizationRoleResponse[]>(
    `/organization-role/by-organization/${organizationId}`,
    {
      method: 'GET',
    },
  );
}
