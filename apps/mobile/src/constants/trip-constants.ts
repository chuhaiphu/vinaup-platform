import { TRIP_STATUS } from '@vinaup-platform/validation';
import type { TripStatus } from '@vinaup-platform/validation';

// Wire enums referenced by shared Zod schemas live in the package (§1.3).
export { TRIP_STATUS } from '@vinaup-platform/validation';
export type { TripStatus } from '@vinaup-platform/validation';

export const TripStatusDisplay: Record<TripStatus, string> = {
  [TRIP_STATUS.DRAFT]: 'Nháp',
  [TRIP_STATUS.ONGOING]: 'Đang chạy',
  [TRIP_STATUS.COMPLETED]: 'Hoàn tất',
  [TRIP_STATUS.CANCELLED]: 'Đã huỷ',
};

export const TripStatusOptions: { value: TripStatus | ''; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: TRIP_STATUS.DRAFT, label: TripStatusDisplay.DRAFT },
  { value: TRIP_STATUS.ONGOING, label: TripStatusDisplay.ONGOING },
  { value: TRIP_STATUS.COMPLETED, label: TripStatusDisplay.COMPLETED },
  { value: TRIP_STATUS.CANCELLED, label: TripStatusDisplay.CANCELLED },
];
