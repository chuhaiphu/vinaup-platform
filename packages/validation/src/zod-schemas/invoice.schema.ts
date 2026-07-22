import { z } from 'zod';

import { INVOICE_STATUS } from '../constants/invoice.constant';
import {
  dateInstanceFilterFields,
  isEndDateOnOrAfterStartDate,
  isEndDatePresentWhenStartDate,
  isStartDatePresentWhenEndDate,
} from './_shared/date-filter.schema';

const invoiceFields = z.strictObject({
  code: z.string().trim().min(1).nullish(),
  description: z.string().trim().min(1),
  endDate: z.iso.datetime(),
  startDate: z.iso.datetime(),
  invoiceTypeId: z.string().trim().min(1), // existence is checked in the service, not here
  note: z.string().trim().min(1).nullish(),
  organizationId: z.string().trim().min(1).nullish(),
  organizationCustomerId: z.string().trim().min(1).nullish(),
  externalOrganizationName: z.string().trim().min(1).nullish(),
  externalCustomerName: z.string().trim().min(1).nullish(),
});

export const createInvoiceSchema = invoiceFields.refine(isEndDateOnOrAfterStartDate, {
  error: 'endDate must be on or after startDate',
  path: ['endDate'],
});

export const updateInvoiceSchema = invoiceFields
  .partial()
  .extend({
    status: z.enum(INVOICE_STATUS).optional(), // update-only field; NOT NULL column → .optional()
    // NON-nullable @default(0) columns: a client-sent null (e.g. NaN serialized to null)
    // is coerced to 0 before it can reach the column; omit still means "leave unchanged".
    discountAmount: z
      .number()
      .nullable()
      .transform((value) => value ?? 0)
      .optional(),
    vatRate: z
      .number()
      .nullable()
      .transform((value) => value ?? 0)
      .optional(),
    surchargeAmount: z
      .number()
      .nullable()
      .transform((value) => value ?? 0)
      .optional(),
  })
  .refine(isEndDateOnOrAfterStartDate, {
    error: 'endDate must be on or after startDate',
    path: ['endDate'],
  });

export const invoiceFilterSchema = z
  .strictObject({
    ...dateInstanceFilterFields,
    invoiceTypeId: z.uuid().optional(),
    status: z.enum(INVOICE_STATUS).optional(),
  })
  .refine(isStartDatePresentWhenEndDate, {
    error: 'startDate is required when endDate is provided',
    path: ['startDate'],
  })
  .refine(isEndDatePresentWhenStartDate, {
    error: 'endDate is required when startDate is provided',
    path: ['endDate'],
  });
