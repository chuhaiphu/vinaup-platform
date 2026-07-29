import { wireData } from 'fetchwire';

import {
  CreateOrganizationCustomerRequest,
  OrganizationCustomerResponse,
  UpdateOrganizationCustomerRequest,
} from '@/interfaces/organization-customer-interfaces';

export async function createOrganizationCustomer(data: CreateOrganizationCustomerRequest) {
  return wireData<OrganizationCustomerResponse>('/organization-customer', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getOrganizationCustomersByOrganizationId(organizationId: string) {
  return wireData<OrganizationCustomerResponse[]>(
    `/organization-customer/by-organization/${organizationId}`,
    {
      method: 'GET',
    },
  );
}

export async function updateOrganizationCustomer(
  id: string,
  data: UpdateOrganizationCustomerRequest,
) {
  return wireData<OrganizationCustomerResponse>(`/organization-customer/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
