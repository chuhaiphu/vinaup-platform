export const ORGANIZATION_MEMBER_TYPE = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
} as const;
export type OrganizationMemberType = (typeof ORGANIZATION_MEMBER_TYPE)[keyof typeof ORGANIZATION_MEMBER_TYPE];
