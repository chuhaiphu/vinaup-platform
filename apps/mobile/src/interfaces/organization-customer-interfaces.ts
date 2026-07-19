import { OrganizationCustomerStatus } from '@/constants/organization-constants';

import { OrganizationResponse } from './organization-interfaces';
import { UserResponse } from './user-interfaces';

export type {
  CreateOrganizationCustomerRequestInterface as CreateOrganizationCustomerRequest,
  UpdateOrganizationCustomerRequestInterface as UpdateOrganizationCustomerRequest,
} from '@vinaup-platform/validation';

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
