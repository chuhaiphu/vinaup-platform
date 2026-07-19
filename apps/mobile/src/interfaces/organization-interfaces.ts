import { OrganizationIndustryResponse } from './organization-industry-interfaces';
import { UserResponse } from './user-interfaces';

export type {
  CreateOrganizationRequestInterface as CreateOrganizationRequest,
  UpdateOrganizationRequestInterface as UpdateOrganizationRequest,
} from '@vinaup-platform/validation';

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
