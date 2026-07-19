export const WAGE_STATUS = {
  PROCESSING: 'PROCESSING',
  DONE: 'DONE',
  PAID: 'PAID',
  PENDING: 'PENDING',
  SHIPPING: 'SHIPPING',
  RECEIVED: 'RECEIVED',
  CANCELLED: 'CANCELLED',
} as const;
export type WageStatus = (typeof WAGE_STATUS)[keyof typeof WAGE_STATUS];

export const WageStatusDisplay: Record<WageStatus, string> = {
  [WAGE_STATUS.PROCESSING]: 'Đang xử lý',
  [WAGE_STATUS.DONE]: 'Hoàn tất',
  [WAGE_STATUS.PAID]: 'Đã thanh toán',
  [WAGE_STATUS.PENDING]: 'Chờ duyệt',
  [WAGE_STATUS.SHIPPING]: 'Đang giao',
  [WAGE_STATUS.RECEIVED]: 'Đã nhận',
  [WAGE_STATUS.CANCELLED]: 'Đã hủy',
};

export const WageStatusOptions: { value: WageStatus | ''; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: WAGE_STATUS.PROCESSING, label: WageStatusDisplay.PROCESSING },
  { value: WAGE_STATUS.DONE, label: WageStatusDisplay.DONE },
  { value: WAGE_STATUS.PAID, label: WageStatusDisplay.PAID },
  { value: WAGE_STATUS.PENDING, label: WageStatusDisplay.PENDING },
  { value: WAGE_STATUS.SHIPPING, label: WageStatusDisplay.SHIPPING },
  { value: WAGE_STATUS.RECEIVED, label: WageStatusDisplay.RECEIVED },
  { value: WAGE_STATUS.CANCELLED, label: WageStatusDisplay.CANCELLED },
];
