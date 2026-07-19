import { z } from 'zod';

import {
  RECEIPT_PAYMENT_DEPOSIT_TYPE,
  RECEIPT_PAYMENT_TRANSACTION_TYPE,
  RECEIPT_PAYMENT_TYPE,
} from '../constants/receipt-payment.constant';
import { assertDateRangeComplete, dateFilterFields } from './_shared/date-filter.schema';

// Existence of every *Id reference below is checked in the service, not here.
const receiptPaymentFields = z.strictObject({
  type: z.enum(RECEIPT_PAYMENT_TYPE),
  description: z.string().trim().min(1),
  unitPrice: z.number(),
  currency: z.string().trim().min(1),
  transactionType: z.enum(RECEIPT_PAYMENT_TRANSACTION_TYPE),
  transactionDate: z.iso.datetime(),
  quantity: z.number(),
  frequency: z.number(),
  vatRate: z.number().optional(), // NOT NULL column with @default → .optional()
  depositAmount: z.number().optional(), // NOT NULL column with @default → .optional()
  depositType: z.enum(RECEIPT_PAYMENT_DEPOSIT_TYPE).nullish(),
  note: z.string().trim().min(1).nullish(),
  projectId: z.string().trim().min(1).nullish(),
  invoiceId: z.string().trim().min(1).nullish(),
  organizationId: z.string().trim().min(1).nullish(),
  tourCalculationId: z.string().trim().min(1).nullish(),
  tourImplementationId: z.string().trim().min(1).nullish(),
  tourSettlementId: z.string().trim().min(1).nullish(),
  groupCode: z.string().trim().min(1).optional(), // transient input (not a column) consumed by the service
  bookingId: z.string().trim().min(1).nullish(),
  wageId: z.string().trim().min(1).nullish(),
  categoryId: z.string().trim().min(1).nullish(),
  carMaintenanceLogId: z.string().trim().min(1).nullish(),
  tripId: z.string().trim().min(1).nullish(),
});

export const createReceiptPaymentSchema = receiptPaymentFields;

export const updateReceiptPaymentSchema = receiptPaymentFields.partial();

export const createReceiptPaymentCategorySchema = z.strictObject({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1).nullish(),
  organizationId: z.string().trim().min(1).nullish(),
});

export const updateReceiptPaymentCategorySchema = createReceiptPaymentCategorySchema.partial();

export const findReceiptPaymentsByProjectIdsSchema = z.strictObject({
  projectIds: z.array(z.string()),
});

export const findReceiptPaymentsByInvoiceIdsSchema = z.strictObject({
  invoiceIds: z.array(z.string()),
});

export const findReceiptPaymentsByWageIdsSchema = z.strictObject({
  wageIds: z.array(z.string()),
});

export const receiptPaymentFilterSchema = z
  .strictObject({
    ...dateFilterFields,
    type: z.enum(RECEIPT_PAYMENT_TYPE).optional(),
    transactionType: z.enum(RECEIPT_PAYMENT_TRANSACTION_TYPE).optional(),
  })
  .superRefine(assertDateRangeComplete);
