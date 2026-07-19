import { CAR_STATUS } from '@vinaup-platform/validation';
import type { CarStatus } from '@vinaup-platform/validation';

import { CarResponse } from '@/interfaces/car-interfaces';

import { BADGE_VARIANT, BadgeVariant } from './style-constants';

// Wire enums referenced by shared Zod schemas live in the package (§1.3).
export { CAR_STATUS } from '@vinaup-platform/validation';
export type { CarStatus } from '@vinaup-platform/validation';

// Technical status — user-set, stored on Car.status. LOCKED blocks trip assignment.
export const CarStatusDisplay: Record<CarStatus, string> = {
  [CAR_STATUS.READY]: 'Sẵn sàng',
  [CAR_STATUS.NEEDS_CHECK]: 'Cần kiểm tra',
  [CAR_STATUS.LOCKED]: 'Đang sửa',
};

// Options for the technical-status picker (no "all" entry — this edits a single value).
export const CarStatusOptions: { value: CarStatus; label: string }[] = [
  { value: CAR_STATUS.READY, label: CarStatusDisplay.READY },
  { value: CAR_STATUS.NEEDS_CHECK, label: CarStatusDisplay.NEEDS_CHECK },
  { value: CAR_STATUS.LOCKED, label: CarStatusDisplay.LOCKED },
];

// Operational status — derived on the API from trip assignments, delivered via CarMeta.
export const CAR_OPERATIONAL_STATUS = {
  OPERATING: 'OPERATING',
  RESTING: 'RESTING',
} as const;

export type CarOperationalStatus =
  (typeof CAR_OPERATIONAL_STATUS)[keyof typeof CAR_OPERATIONAL_STATUS];

export const CarOperationalStatusDisplay: Record<CarOperationalStatus, string> = {
  [CAR_OPERATIONAL_STATUS.OPERATING]: 'Đang chạy',
  [CAR_OPERATIONAL_STATUS.RESTING]: 'Nằm bãi',
};

export const CarOperationalStatusVariant: Record<CarOperationalStatus, BadgeVariant> = {
  [CAR_OPERATIONAL_STATUS.OPERATING]: BADGE_VARIANT.GREEN,
  [CAR_OPERATIONAL_STATUS.RESTING]: BADGE_VARIANT.GRAY,
};

export const CAR_EXPIRY_WARNING_DAYS = 30;

export const CAR_EXPIRY_FIELDS = [
  { key: 'inspectionExpiryDate', label: 'Đăng kiểm' },
  { key: 'roadFeeExpiryDate', label: 'Phí đường bộ' },
  { key: 'insuranceExpiryDate', label: 'Bảo hiểm xe' },
  { key: 'badgeExpiryDate', label: 'Phù hiệu xe' },
] as const;

export const FUEL_TYPE = {
  XANG_95: 'XANG_95',
  XANG_E10: 'XANG_E10',
  DIESEL: 'DIESEL',
  ELECTRIC: 'ELECTRIC',
} as const;

export type FuelType = (typeof FUEL_TYPE)[keyof typeof FUEL_TYPE];

export const FuelTypeDisplay: Record<FuelType, string> = {
  [FUEL_TYPE.XANG_95]: 'Xăng 95-V',
  [FUEL_TYPE.XANG_E10]: 'Xăng E10-V',
  [FUEL_TYPE.DIESEL]: 'Dầu Diesel-V',
  [FUEL_TYPE.ELECTRIC]: 'Điện',
};

export const CAR_ASSIGNMENT_EVENT_ACTION = {
  ASSIGNED: 'ASSIGNED',
  UNASSIGNED: 'UNASSIGNED',
} as const;

export type CarAssignmentEventAction =
  (typeof CAR_ASSIGNMENT_EVENT_ACTION)[keyof typeof CAR_ASSIGNMENT_EVENT_ACTION];

export const CarAssignmentEventActionDisplay: Record<CarAssignmentEventAction, string> = {
  [CAR_ASSIGNMENT_EVENT_ACTION.ASSIGNED]: 'Ghép',
  [CAR_ASSIGNMENT_EVENT_ACTION.UNASSIGNED]: 'Huỷ',
};

export const CAR_MANUFACTURER_LIST: string[] = [
  'Thaco',
  'Hyundai',
  'Ford',
  'Toyota',
  'Kia',
  'Hino',
  'Isuzu',
  'Samco',
  'Mercedes-Benz',
  'Honda',
  'Mazda',
  'VinFast',
];

export const CAR_CATEGORY_LIST: string[] = ['Ghế ngồi', 'Giường nằm', 'Limousine', 'Cabin'];

// ─── List filter options — each leads with an empty "Tất cả" entry so the car list
// filter bar can clear the constraint (unlike the single-value editor pickers above).
export const CarStatusFilterOptions: { value: CarStatus | ''; label: string }[] = [
  { value: '', label: 'Tất cả' },
  ...CarStatusOptions,
];

export const CarOperationalStatusFilterOptions: {
  value: CarOperationalStatus | '';
  label: string;
}[] = [
  { value: '', label: 'Tất cả' },
  { value: CAR_OPERATIONAL_STATUS.OPERATING, label: CarOperationalStatusDisplay.OPERATING },
  { value: CAR_OPERATIONAL_STATUS.RESTING, label: CarOperationalStatusDisplay.RESTING },
];

export const CAR_MIN_YEAR = 1900;
export const CAR_MIN_SEAT_COUNT = 2;
export const CAR_MAX_SEAT_COUNT = 55;

export function getCarYearList(): number[] {
  const currentYear = new Date().getFullYear();
  const yearList: number[] = [];
  for (let year = currentYear; year >= CAR_MIN_YEAR; year--) {
    yearList.push(year);
  }
  return yearList;
}

export function getCarSeatCountList(): number[] {
  const seatCountList: number[] = [];
  for (let seatCount = CAR_MIN_SEAT_COUNT; seatCount <= CAR_MAX_SEAT_COUNT; seatCount++) {
    seatCountList.push(seatCount);
  }
  return seatCountList;
}

// ─── Seat-count list-filter options, derived from the cars actually on screen ─────
export function getCarSeatCountFilterOptions(
  carList: CarResponse[],
): { value: string; label: string }[] {
  const seatCountSet = new Set<number>();
  for (const car of carList) {
    if (car.seatCount != null) seatCountSet.add(car.seatCount);
  }
  const sortedSeatCountList = [...seatCountSet].sort((a, b) => a - b);

  return [
    { value: '', label: 'Tất cả' },
    ...sortedSeatCountList.map((seatCount) => ({
      value: String(seatCount),
      label: `${seatCount} chỗ`,
    })),
  ];
}
