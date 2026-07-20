export const ORGANIZATION_MEMBER_STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  LOCKED: 'LOCKED'
} as const;
export type OrganizationMemberStatus = (typeof ORGANIZATION_MEMBER_STATUS)[keyof typeof ORGANIZATION_MEMBER_STATUS];

export const ORGANIZATION_ROLE_CODE = {
  OWNER: 'OWNER',
  MEMBER: 'MEMBER',
} as const;
export type OrganizationRoleCode = (typeof ORGANIZATION_ROLE_CODE)[keyof typeof ORGANIZATION_ROLE_CODE];

// Vietnamese display for each system role code — used when seeding the default roles.
export const ORGANIZATION_ROLE_DESCRIPTION: Record<string, string> = {
  [ORGANIZATION_ROLE_CODE.OWNER]: 'Chủ sở hữu',
  [ORGANIZATION_ROLE_CODE.MEMBER]: 'Thành viên',
};
