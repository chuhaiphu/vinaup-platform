// @vinaup-platform/permission — public surface.

// ─── RBAC plane (Plane 1): the shared authorization engine ─────
export { PERMISSION_ACTION, PERMISSION_RESOURCE } from './rbac/permission.constant';
export type { PermissionAction, PermissionResource } from './rbac/permission.constant';
export { DEFAULT_ROLE_PERMISSIONS } from './rbac/default-role-permissions';
export { getUserAbility } from './rbac/get-user-ability';
export type { PermissionRule } from './rbac/permission.interface';

// ─── ReBAC plane (Plane 2): tour-participation vocabulary (the check lives in the API service) ─────
export {
  TOUR_IMPLEMENTATION_MEMBER_ROLE,
  TOUR_IMPLEMENTATION_USER_ROLE,
  RECEIPT_PAYMENT_GROUP_CODE,
  TOUR_ASSIGNMENT_PERMISSION,
} from './rebac/tour-participation.constant';
export type {
  TourImplementationMemberRole,
  TourImplementationUserRole,
  ReceiptPaymentGroupCode,
  TourAssignmentPermission,
} from './rebac/tour-participation.constant';
