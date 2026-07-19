export const INVOICE_DISCOUNT_TYPE = {
  PERCENT: 'PERCENT',
  FLAT: 'FLAT',
} as const;
export type InvoiceDiscountType = (typeof INVOICE_DISCOUNT_TYPE)[keyof typeof INVOICE_DISCOUNT_TYPE];
