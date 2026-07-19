import { TOUR_STATUS } from '@vinaup-platform/validation';
import type { TourStatus } from '@vinaup-platform/validation';

// Wire enums referenced by shared Zod schemas live in the package (§1.3).
export { TOUR_IMPLEMENTATION_ADVANCE_TYPE, TOUR_STATUS } from '@vinaup-platform/validation';
export type { TourImplementationAdvanceType, TourStatus } from '@vinaup-platform/validation';

export const TourStatusDisplay: Record<TourStatus, string> = {
  [TOUR_STATUS.PENDING]: 'Chờ chốt',
  [TOUR_STATUS.CONFIRMED]: 'Đã chốt',
  [TOUR_STATUS.IN_PROGRESS]: 'Đang xử lý',
  [TOUR_STATUS.COMPLETED]: 'Hoàn thành',
  [TOUR_STATUS.CANCELLED]: 'Đã hủy',
};

export const TourStatusOptions: { value: TourStatus | ''; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: TOUR_STATUS.PENDING, label: TourStatusDisplay[TOUR_STATUS.PENDING] },
  { value: TOUR_STATUS.CONFIRMED, label: TourStatusDisplay[TOUR_STATUS.CONFIRMED] },
  { value: TOUR_STATUS.IN_PROGRESS, label: TourStatusDisplay[TOUR_STATUS.IN_PROGRESS] },
  { value: TOUR_STATUS.COMPLETED, label: TourStatusDisplay[TOUR_STATUS.COMPLETED] },
  { value: TOUR_STATUS.CANCELLED, label: TourStatusDisplay[TOUR_STATUS.CANCELLED] },
];

export const USER_ASSIGNED_OPTION = {
  TEXT_INPUT: 0,
  ORGANIZATION_MEMBER: 1,
  ACCOUNT: 2,
} as const;
export type UserAssignedOption = (typeof USER_ASSIGNED_OPTION)[keyof typeof USER_ASSIGNED_OPTION];
