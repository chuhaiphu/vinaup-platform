import {
  OrganizationMemberStatus,
  OrganizationMemberType,
} from '@/constants/organization-constants';

import { OrganizationResponse } from './organization-interfaces';
import { OrganizationRoleResponse } from './organization-role-interfaces';
import { UserResponse } from './user-interfaces';

export type {
  CreateOrganizationMemberRequestInterface as CreateOrganizationMemberRequest,
  UpdateOrganizationMemberRequestInterface as UpdateOrganizationMemberRequest,
} from '@vinaup-platform/validation';

export interface OrganizationMemberResponse {
  id: string;
  organizationId: string;
  type: OrganizationMemberType;
  name: string;
  phone: string;
  email: string | null;
  avatarUrl: string | null;
  address: string | null;
  status: OrganizationMemberStatus;
  joinedAt: string;
  createdByUserId: string | null;
  createdBy: UserResponse | null;
  userId: string | null;
  user: UserResponse | null;
  organizationRoleId: string;
  organization: OrganizationResponse;
  organizationRole: OrganizationRoleResponse;
}

export interface DeleteOrganizationMemberRequest {
  organizationId: string;
}
