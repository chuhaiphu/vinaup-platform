export const TRIP_STATUS = {
  DRAFT: 'DRAFT',
  ONGOING: 'ONGOING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type TripStatus = (typeof TRIP_STATUS)[keyof typeof TRIP_STATUS];

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
