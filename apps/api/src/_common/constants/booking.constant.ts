export const BOOKING_STATUS = {
  DRAFT: 'DRAFT',
  SENDER_SIGNED: 'SENDER_SIGNED',
  COMPLETED: 'COMPLETED',
} as const;

export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];
