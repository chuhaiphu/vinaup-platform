import { PERMISSION_ACTION, PERMISSION_RESOURCE } from './permission.constant';
import type { PermissionAction, PermissionResource } from './permission.constant';

const { READ, CREATE, MANAGE } = PERMISSION_ACTION;
const { ALL, ATTENDANCE_RECORD } = PERMISSION_RESOURCE;

// Every non-wildcard resource (ALL is the OWNER-only wildcard).
const NON_WILDCARD_RESOURCES = Object.values(PERMISSION_RESOURCE).filter(
  (resource) => resource !== ALL,
);

// POLICY as DATA — the factory-default matrix a fresh organization starts with.
export const DEFAULT_ROLE_PERMISSIONS: Record<
  string,
  { action: PermissionAction; resource: PermissionResource }[]
> = {
  // Full access — not editable (RBAC-ReBAC-PATTERN §3 — invariant 1).
  OWNER: [{ action: MANAGE, resource: ALL }],

  // Safe baseline: read the organization's data, plus self-service check-in.
  // Members still mutate records they created (ownership invariant);
  MEMBER: [
    ...NON_WILDCARD_RESOURCES.map((resource) => ({ action: READ, resource })),
    { action: CREATE, resource: ATTENDANCE_RECORD },
  ],
};
