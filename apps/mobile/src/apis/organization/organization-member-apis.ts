import { wireData } from 'fetchwire';

import {
  CreateOrganizationMemberRequest,
  DeleteOrganizationMemberRequest,
  OrganizationMemberResponse,
  UpdateOrganizationMemberRequest,
} from '@/interfaces/organization-member-interfaces';

export async function createOrganizationMember(data: CreateOrganizationMemberRequest) {
  return wireData<OrganizationMemberResponse>('/organization-member', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateOrganizationMember(
  id: string,
  data: Partial<UpdateOrganizationMemberRequest>,
) {
  return wireData<OrganizationMemberResponse>(`/organization-member/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteOrganizationMember(id: string, data: DeleteOrganizationMemberRequest) {
  return wireData<void>(`/organization-member/${id}`, {
    method: 'DELETE',
    body: JSON.stringify(data),
  });
}

export async function getOrganizationMembersByOrganizationId(organizationId: string) {
  return wireData<OrganizationMemberResponse[]>(
    `/organization-member?organizationId=${organizationId}`,
    {
      method: 'GET',
    },
  );
}

export async function getOrganizationMemberById(id: string) {
  return wireData<OrganizationMemberResponse>(`/organization-member/${id}`, {
    method: 'GET',
  });
}
