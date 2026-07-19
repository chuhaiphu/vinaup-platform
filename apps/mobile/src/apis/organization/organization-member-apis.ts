import { wireApi } from 'fetchwire';

import {
  CreateOrganizationMemberRequest,
  DeleteOrganizationMemberRequest,
  OrganizationMemberResponse,
  UpdateOrganizationMemberRequest,
} from '@/interfaces/organization-member-interfaces';

export async function createOrganizationMember(data: CreateOrganizationMemberRequest) {
  return wireApi<OrganizationMemberResponse>('/organization-member', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateOrganizationMember(
  id: string,
  data: Partial<UpdateOrganizationMemberRequest>,
) {
  return wireApi<OrganizationMemberResponse>(`/organization-member/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteOrganizationMember(id: string, data: DeleteOrganizationMemberRequest) {
  return wireApi<void>(`/organization-member/${id}`, {
    method: 'DELETE',
    body: JSON.stringify(data),
  });
}

export async function getOrganizationMembersByOrganizationId(organizationId: string) {
  return wireApi<OrganizationMemberResponse[]>(
    `/organization-member?organizationId=${organizationId}`,
    {
      method: 'GET',
    },
  );
}

export async function getOrganizationMemberById(id: string) {
  return wireApi<OrganizationMemberResponse>(`/organization-member/${id}`, {
    method: 'GET',
  });
}
