export const INVOICE_STATUS = {
  PROCESSING: 'PROCESSING',
  DONE: 'DONE',
  PAID: 'PAID',
  PENDING: 'PENDING',
  SHIPPING: 'SHIPPING',
  RECEIVED: 'RECEIVED',
  CANCELLED: 'CANCELLED',
} as const;
export type InvoiceStatus = (typeof INVOICE_STATUS)[keyof typeof INVOICE_STATUS];

export const INVOICE_DISCOUNT_TYPE = {
  PERCENT: 'PERCENT',
  FLAT: 'FLAT',
} as const;
export type InvoiceDiscountType = (typeof INVOICE_DISCOUNT_TYPE)[keyof typeof INVOICE_DISCOUNT_TYPE];