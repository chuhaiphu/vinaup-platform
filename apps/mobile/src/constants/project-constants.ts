export const PROJECT_STATUS = {
  PROCESSING: 'PROCESSING',
  DONE: 'DONE',
  PAID: 'PAID',
  PENDING: 'PENDING',
  SHIPPING: 'SHIPPING',
  RECEIVED: 'RECEIVED',
  CANCELLED: 'CANCELLED',
} as const;
export type ProjectStatus = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];

export const ProjectStatusDisplay: Record<ProjectStatus, string> = {
  [PROJECT_STATUS.PROCESSING]: 'Đang xử lý',
  [PROJECT_STATUS.DONE]: 'Hoàn tất',
  [PROJECT_STATUS.PAID]: 'Đã thanh toán',
  [PROJECT_STATUS.PENDING]: 'Chờ duyệt',
  [PROJECT_STATUS.SHIPPING]: 'Đang giao',
  [PROJECT_STATUS.RECEIVED]: 'Đã nhận',
  [PROJECT_STATUS.CANCELLED]: 'Đã hủy',
};

export const ProjectStatusOptions: { value: ProjectStatus | ''; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: PROJECT_STATUS.PROCESSING, label: ProjectStatusDisplay.PROCESSING },
  { value: PROJECT_STATUS.DONE, label: ProjectStatusDisplay.DONE },
  { value: PROJECT_STATUS.PAID, label: ProjectStatusDisplay.PAID },
  { value: PROJECT_STATUS.PENDING, label: ProjectStatusDisplay.PENDING },
  { value: PROJECT_STATUS.SHIPPING, label: ProjectStatusDisplay.SHIPPING },
  { value: PROJECT_STATUS.RECEIVED, label: ProjectStatusDisplay.RECEIVED },
  { value: PROJECT_STATUS.CANCELLED, label: ProjectStatusDisplay.CANCELLED },
];
