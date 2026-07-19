import { INVOICE_STATUS } from '@vinaup-platform/validation';
import type { InvoiceStatus } from '@vinaup-platform/validation';

// Wire enums referenced by shared Zod schemas live in the package (§1.3).
export { INVOICE_STATUS } from '@vinaup-platform/validation';
export type { InvoiceStatus } from '@vinaup-platform/validation';

export const InvoiceStatusDisplay: Record<InvoiceStatus, string> = {
  [INVOICE_STATUS.PROCESSING]: 'Đang xử lý',
  [INVOICE_STATUS.DONE]: 'Hoàn tất',
  [INVOICE_STATUS.PAID]: 'Đã thanh toán',
  [INVOICE_STATUS.PENDING]: 'Chờ duyệt',
  [INVOICE_STATUS.SHIPPING]: 'Đang giao',
  [INVOICE_STATUS.RECEIVED]: 'Đã nhận',
  [INVOICE_STATUS.CANCELLED]: 'Đã hủy',
};

export const InvoiceStatusOptions: { value: InvoiceStatus | ''; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: INVOICE_STATUS.PROCESSING, label: InvoiceStatusDisplay.PROCESSING },
  { value: INVOICE_STATUS.DONE, label: InvoiceStatusDisplay.DONE },
  { value: INVOICE_STATUS.PAID, label: InvoiceStatusDisplay.PAID },
  { value: INVOICE_STATUS.PENDING, label: InvoiceStatusDisplay.PENDING },
  { value: INVOICE_STATUS.SHIPPING, label: InvoiceStatusDisplay.SHIPPING },
  { value: INVOICE_STATUS.RECEIVED, label: InvoiceStatusDisplay.RECEIVED },
  { value: INVOICE_STATUS.CANCELLED, label: InvoiceStatusDisplay.CANCELLED },
];
