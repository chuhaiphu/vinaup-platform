export const BOOKING_STATUS = {
  DRAFT: 'DRAFT',
  SENDER_SIGNED: 'SENDER_SIGNED',
  COMPLETED: 'COMPLETED',
} as const;

export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

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
