import type { PermissionAction, PermissionResource } from '@vinaup-platform/permission';

export interface OrganizationAbilityResponse {
  roleCode: string;
  isOwner: boolean;
  permissions: { action: PermissionAction; resource: PermissionResource; scope: string }[];
}
