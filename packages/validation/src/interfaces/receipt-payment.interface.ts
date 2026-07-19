import type { z } from 'zod';

import {
  createReceiptPaymentCategorySchema,
  createReceiptPaymentSchema,
  findReceiptPaymentsByInvoiceIdsSchema,
  findReceiptPaymentsByProjectIdsSchema,
  findReceiptPaymentsByWageIdsSchema,
  receiptPaymentFilterSchema,
  updateReceiptPaymentCategorySchema,
  updateReceiptPaymentSchema,
} from '../zod-schemas/receipt-payment.schema';

export type CreateReceiptPaymentRequestInterface = z.infer<typeof createReceiptPaymentSchema>;
export type UpdateReceiptPaymentRequestInterface = z.infer<typeof updateReceiptPaymentSchema>;
export type CreateReceiptPaymentCategoryRequestInterface = z.infer<typeof createReceiptPaymentCategorySchema>;
export type UpdateReceiptPaymentCategoryRequestInterface = z.infer<typeof updateReceiptPaymentCategorySchema>;
export type FindReceiptPaymentsByProjectIdsRequestInterface = z.infer<typeof findReceiptPaymentsByProjectIdsSchema>;
export type FindReceiptPaymentsByInvoiceIdsRequestInterface = z.infer<typeof findReceiptPaymentsByInvoiceIdsSchema>;
export type FindReceiptPaymentsByWageIdsRequestInterface = z.infer<typeof findReceiptPaymentsByWageIdsSchema>;
export type ReceiptPaymentFilterRequestInterface = z.infer<typeof receiptPaymentFilterSchema>;
