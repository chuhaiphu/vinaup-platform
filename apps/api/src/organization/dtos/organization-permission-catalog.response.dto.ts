import type { PermissionAction, PermissionResource } from '@vinaup-platform/permission';

export interface OrganizationPermissionCatalogCellResponse {
  group: string;
  resource: PermissionResource;
  scope: string; // '' = the whole resource
  label: string;
  actions: PermissionAction[];
}
