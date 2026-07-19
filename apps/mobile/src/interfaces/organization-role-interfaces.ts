export interface OrganizationPermissionResponse {
  id: string;
  resource: string;
  action: string;
}

export interface OrganizationRoleResponse {
  id: string;
  code: string;
  description: string;
  organizationId: string;
  organizationRolePermissions: {
    id: string;
    organizationRoleId: string;
    organizationPermissionId: string;
    organizationPermission: OrganizationPermissionResponse;
  }[];
}
