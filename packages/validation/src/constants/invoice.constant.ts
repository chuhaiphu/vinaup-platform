// Code-defined, fixed set (same idiom as INVOICE_STATUS) — persisted as a plain String column.
export const INVOICE_TYPE = {
  SELL: 'SELL',
  BUY: 'BUY',
} as const;
export type InvoiceType = (typeof INVOICE_TYPE)[keyof typeof INVOICE_TYPE];

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
