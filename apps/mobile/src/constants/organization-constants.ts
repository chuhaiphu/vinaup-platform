export const ORGANIZATION_CUSTOMER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;
export type OrganizationCustomerStatus =
  (typeof ORGANIZATION_CUSTOMER_STATUS)[keyof typeof ORGANIZATION_CUSTOMER_STATUS];

export const ORGANIZATION_MEMBER_STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  LOCKED: 'LOCKED',
} as const;
export type OrganizationMemberStatus =
  (typeof ORGANIZATION_MEMBER_STATUS)[keyof typeof ORGANIZATION_MEMBER_STATUS];

export const ORGANIZATION_MEMBER_TYPE = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
} as const;
export type OrganizationMemberType =
  (typeof ORGANIZATION_MEMBER_TYPE)[keyof typeof ORGANIZATION_MEMBER_TYPE];

export const OrganizationMemberStatusDisplay: Record<OrganizationMemberStatus, string> = {
  [ORGANIZATION_MEMBER_STATUS.PENDING]: 'Đang chờ',
  [ORGANIZATION_MEMBER_STATUS.ACTIVE]: 'Đang hoạt động',
  [ORGANIZATION_MEMBER_STATUS.LOCKED]: 'Tạm khóa',
};

export const OrganizationMemberTypeDisplay: Record<OrganizationMemberType, string> = {
  [ORGANIZATION_MEMBER_TYPE.FULL_TIME]: 'Chính thức',
  [ORGANIZATION_MEMBER_TYPE.PART_TIME]: 'Thời vụ',
};
