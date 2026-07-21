import { wireApi } from 'fetchwire';

import { OrganizationIndustryResponse } from '@/interfaces/organization-industry-interfaces';
import {
  CreateOrganizationRequest,
  OrganizationAbilityResponse,
  OrganizationResponse,
  UpdateOrganizationRequest,
} from '@/interfaces/organization-interfaces';

export async function getOrganizationsOfCurrentUser() {
  return wireApi<OrganizationResponse[]>('/organization', {
    method: 'GET',
  });
}

export async function getMyAbilityInOrganization(id: string) {
  return wireApi<OrganizationAbilityResponse>(`/organization/${id}/my-ability`, {
    method: 'GET',
  });
}

export async function getOrganizationById(id: string) {
  return wireApi<OrganizationResponse>(`/organization/${id}`, {
    method: 'GET',
  });
}

export async function getAllOrganizations() {
  return wireApi<OrganizationResponse[]>('/organization/all', {
    method: 'GET',
  });
}

export async function getOrganizationIndustries() {
  return wireApi<OrganizationIndustryResponse[]>('/organization/industries', {
    method: 'GET',
  });
}

export async function createOrganization(data: CreateOrganizationRequest) {
  return wireApi<OrganizationResponse>('/organization', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateOrganization(id: string, data: UpdateOrganizationRequest) {
  return wireApi<OrganizationResponse>(`/organization/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteOrganization(id: string) {
  return wireApi<void>(`/organization/${id}`, {
    method: 'DELETE',
  });
}
