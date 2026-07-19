import { OrganizationIndustryResponse } from './organization-industry-interfaces';
import { UserResponse } from './user-interfaces';

export interface CreateOrganizationRequest {
  name: string;
  email?: string | null;
  phone: string;
  address?: string | null;
  province: string;
  website?: string | null;
  avatarUrl?: string | null;
  organizationIndustryId: string;
}

export type UpdateOrganizationRequest = Partial<CreateOrganizationRequest> & {
  description?: string | null;
};

export interface OrganizationResponse {
  id: string;
  name: string;
  description?: string | null;
  email: string | null;
  phone: string;
  address: string | null;
  website: string | null;
  avatarUrl: string | null;
  province: string;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string | null;
  createdBy: UserResponse | null;
  organizationIndustryId: string;
  organizationIndustry: OrganizationIndustryResponse;
  memberCount?: number;
  memberLinkedCount?: number;
}
