import { wireData } from 'fetchwire';

import { OrganizationIndustryResponse } from '@/interfaces/organization-industry-interfaces';
import {
  CreateOrganizationRequest,
  OrganizationAbilityResponse,
  OrganizationResponse,
  UpdateOrganizationRequest,
} from '@/interfaces/organization-interfaces';

export async function getOrganizationsOfCurrentUser() {
  return wireData<OrganizationResponse[]>('/organization', {
    method: 'GET',
  });
}

export async function getMyAbilityInOrganization(id: string) {
  return wireData<OrganizationAbilityResponse>(`/organization/${id}/my-ability`, {
    method: 'GET',
  });
}

export async function getOrganizationById(id: string) {
  return wireData<OrganizationResponse>(`/organization/${id}`, {
    method: 'GET',
  });
}

export async function getAllOrganizations() {
  return wireData<OrganizationResponse[]>('/organization/all', {
    method: 'GET',
  });
}

export async function getOrganizationIndustries() {
  return wireData<OrganizationIndustryResponse[]>('/organization/industries', {
    method: 'GET',
  });
}

export async function createOrganization(data: CreateOrganizationRequest) {
  return wireData<OrganizationResponse>('/organization', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateOrganization(id: string, data: UpdateOrganizationRequest) {
  return wireData<OrganizationResponse>(`/organization/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteOrganization(id: string) {
  return wireData<void>(`/organization/${id}`, {
    method: 'DELETE',
  });
}
