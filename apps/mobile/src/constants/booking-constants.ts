import { BOOKING_STATUS } from '@vinaup-platform/validation';
import type { BookingStatus } from '@vinaup-platform/validation';

// Wire enums referenced by shared Zod schemas live in the package (§1.3).
export { BOOKING_STATUS } from '@vinaup-platform/validation';
export type { BookingStatus } from '@vinaup-platform/validation';

export const BookingStatusDisplay: Record<BookingStatus, string> = {
  [BOOKING_STATUS.DRAFT]: 'Nháp',
  [BOOKING_STATUS.SENDER_SIGNED]: 'Bên gửi đã ký',
  [BOOKING_STATUS.COMPLETED]: 'Hoàn tất',
};

export const BookingStatusOptions: { value: BookingStatus | ''; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: BOOKING_STATUS.DRAFT, label: BookingStatusDisplay.DRAFT },
  { value: BOOKING_STATUS.SENDER_SIGNED, label: BookingStatusDisplay.SENDER_SIGNED },
  { value: BOOKING_STATUS.COMPLETED, label: BookingStatusDisplay.COMPLETED },
];
