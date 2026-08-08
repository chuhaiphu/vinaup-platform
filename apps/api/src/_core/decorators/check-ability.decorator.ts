import { SetMetadata } from '@nestjs/common';
import { PermissionAction, PermissionResource } from '@vinaup-platform/permission';

export const CHECK_ABILITY_KEY = 'checkAbility';

// The (action, resource) cell a route requires — what OrganizationPermissionGuard reads back.
export interface CheckAbilityMetadata {
  action: PermissionAction;
  resource: PermissionResource;
}

// ─── Stamp the route with the (action, resource) cell it requires
// SetMetadata only stores the pair under CHECK_ABILITY_KEY on the handler.
// Nothing runs at request time here — OrganizationPermissionGuard reads it back.
export const CheckAbility = (action: PermissionAction, resource: PermissionResource) =>
  SetMetadata(CHECK_ABILITY_KEY, { action, resource });
