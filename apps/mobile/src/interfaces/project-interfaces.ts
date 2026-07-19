import { ProjectStatus } from '@/constants/project-constants';

import { OrganizationCustomerResponse } from './organization-customer-interfaces';
import { OrganizationResponse } from './organization-interfaces';
import { UserResponse } from './user-interfaces';

export interface ProjectCategoryResponse {
  id: string;
  name: string;
  description: string | null;
  userId: string | null;
  organizationId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectCategoryRequest {
  name: string;
  description?: string | null;
  organizationId?: string | null;
}

export type UpdateProjectCategoryRequest = Partial<CreateProjectCategoryRequest>;

export interface ProjectResponse {
  id: string;
  type: string | null;
  code: string | null;
  description: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  note: string | null;
  createdByUserId: string | null;
  createdBy: UserResponse | null;
  organizationId: string | null;
  organization: OrganizationResponse | null;
  organizationCustomerId: string | null;
  organizationCustomer: OrganizationCustomerResponse | null;
  externalOrganizationName: string | null;
  externalCustomerName: string | null;
  categoryId: string | null;
  category: ProjectCategoryResponse | null;
}

export interface CreateProjectRequest {
  code?: string | null;
  type?: string | null;
  description: string;
  endDate: string;
  startDate: string;
  note?: string | null;
  organizationId?: string | null;
  organizationCustomerId?: string | null;
  externalOrganizationName?: string | null;
  externalCustomerName?: string | null;
  categoryId?: string | null;
}

export type UpdateProjectRequest = Partial<CreateProjectRequest> & {
  status?: ProjectStatus;
};
