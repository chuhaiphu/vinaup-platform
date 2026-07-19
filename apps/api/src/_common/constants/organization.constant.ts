export const ORGANIZATION_MEMBER_STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  LOCKED: 'LOCKED'
} as const;
export type OrganizationMemberStatus = (typeof ORGANIZATION_MEMBER_STATUS)[keyof typeof ORGANIZATION_MEMBER_STATUS];

export const ORGANIZATION_ROLE_CODE = {
  OWNER: 'OWNER',
} as const;
export type OrganizationRoleCode = (typeof ORGANIZATION_ROLE_CODE)[keyof typeof ORGANIZATION_ROLE_CODE];
