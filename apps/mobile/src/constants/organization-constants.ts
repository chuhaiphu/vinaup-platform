import { ORGANIZATION_MEMBER_TYPE } from '@vinaup-platform/validation';
import type { OrganizationMemberType } from '@vinaup-platform/validation';

// Wire enums referenced by shared Zod schemas live in the package (§1.3).
export { ORGANIZATION_MEMBER_TYPE } from '@vinaup-platform/validation';
export type { OrganizationMemberType } from '@vinaup-platform/validation';

export const DEFAULT_ORGANIZATION_TIMEZONE = 'Asia/Ho_Chi_Minh';

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

export const OrganizationMemberStatusDisplay: Record<OrganizationMemberStatus, string> = {
  [ORGANIZATION_MEMBER_STATUS.PENDING]: 'Đang chờ',
  [ORGANIZATION_MEMBER_STATUS.ACTIVE]: 'Đang hoạt động',
  [ORGANIZATION_MEMBER_STATUS.LOCKED]: 'Tạm khóa',
};

export const OrganizationMemberTypeDisplay: Record<OrganizationMemberType, string> = {
  [ORGANIZATION_MEMBER_TYPE.FULL_TIME]: 'Chính thức',
  [ORGANIZATION_MEMBER_TYPE.PART_TIME]: 'Thời vụ',
};
