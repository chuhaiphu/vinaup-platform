import { OrganizationCustomerStatus } from '@/constants/organization-constants';

import { OrganizationResponse } from './organization-interfaces';
import { UserResponse } from './user-interfaces';

export interface OrganizationCustomerResponse {
  id: string;
  organizationId: string;
  createdByUserId: string | null;
  createdBy: UserResponse | null;
  clientUserId: string | null;
  clientUser: UserResponse | null;
  clientOrganizationId: string | null;
  clientOrganization: OrganizationResponse | null;
  name: string;
  phone: string;
  email: string | null;
  status: OrganizationCustomerStatus;
  isSystemDefault: boolean;
  joinedAt: string;
  organization: OrganizationResponse;
}

export interface CreateOrganizationCustomerRequest {
  organizationId: string;
  name: string;
  phone: string;
  email?: string | null;
  status: OrganizationCustomerStatus;
  joinedAt: string;
  clientUserId?: string | null;
  clientOrganizationId?: string | null;
}

export type UpdateOrganizationCustomerRequest = Partial<CreateOrganizationCustomerRequest>;
