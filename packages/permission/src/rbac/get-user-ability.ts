import { AbilityBuilder, createMongoAbility } from '@casl/ability';

import { PERMISSION_ACTION, PERMISSION_RESOURCE } from './permission.constant';
import type { PermissionRule } from './permission.interface';

// The decision engine — the ONLY place in the codebase touching CASL's construction API.
export const getUserAbility = (permissionList: PermissionRule[]) => {
  const { can, build } = new AbilityBuilder(createMongoAbility);

  // ─── DECLARE: one OrganizationPermission row → one rule ─────
  for (const permission of permissionList) {
    const caslAction =
      permission.action === PERMISSION_ACTION.MANAGE ? 'manage' : permission.action;
    const caslSubject =
      permission.resource === PERMISSION_RESOURCE.ALL ? 'all' : permission.resource;

    can(caslAction, caslSubject);
  }

  // ─── COMPILE: seal the rules into the ability ─────
  return build();
};
