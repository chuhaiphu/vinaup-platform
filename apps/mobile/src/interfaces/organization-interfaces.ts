import type { PermissionAction, PermissionResource } from '@vinaup-platform/permission';

import { OrganizationIndustryResponse } from './organization-industry-interfaces';
import { UserResponse } from './user-interfaces';

export type {
  CreateOrganizationRequestInterface as CreateOrganizationRequest,
  UpdateOrganizationRequestInterface as UpdateOrganizationRequest,
} from '@vinaup-platform/validation';

// The current user's authorization state in one organization (GET /organization/:id/my-ability).
// `permissions` feeds getUserAbility to build the ability that gates UI (RBAC-ReBAC-PATTERN §8).
export interface OrganizationAbilityResponse {
  roleCode: string;
  isOwner: boolean;
  permissions: { action: PermissionAction; resource: PermissionResource }[];
}

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
  timezone: string;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string | null;
  createdBy: UserResponse | null;
  organizationIndustryId: string;
  organizationIndustry: OrganizationIndustryResponse;
  memberCount?: number;
  memberLinkedCount?: number;
}
