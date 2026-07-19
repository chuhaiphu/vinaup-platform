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
