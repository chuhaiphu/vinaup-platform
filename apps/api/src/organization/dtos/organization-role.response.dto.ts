import { OrganizationPermission } from 'src/prisma/generated/client';

export class OrganizationRoleResponse {
  id!: string;
  code!: string;
  description!: string;
  organizationId!: string;
  organizationRolePermissions!: {
    id: string;
    organizationRoleId: string;
    organizationPermissionId: string;
    organizationPermission: OrganizationPermission;
  }[];
}
