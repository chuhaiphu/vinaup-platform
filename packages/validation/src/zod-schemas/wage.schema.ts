import { z } from 'zod';

import { WAGE_STATUS } from '../constants/wage.constant';
import {
  assertDateRangeComplete,
  dateFilterFields,
  isEndDateOnOrAfterStartDate,
} from './_shared/date-filter.schema';

const wageFields = z.strictObject({
  code: z.string().trim().min(1).nullish(),
  description: z.string().trim().min(1),
  endDate: z.iso.datetime(),
  startDate: z.iso.datetime(),
  note: z.string().trim().min(1).nullish(),
  externalOrganizationName: z.string().trim().min(1).nullish(),
  externalCustomerName: z.string().trim().min(1).nullish(),
});

export const createWageSchema = wageFields.refine(isEndDateOnOrAfterStartDate, {
  message: 'endDate must be on or after startDate',
  path: ['endDate'],
});

export const updateWageSchema = wageFields
  .partial()
  .extend({
    status: z.enum(WAGE_STATUS).optional(), // update-only field; NOT NULL column → .optional()
  })
  .refine(isEndDateOnOrAfterStartDate, {
    message: 'endDate must be on or after startDate',
    path: ['endDate'],
  });

export const wageFilterSchema = z
  .strictObject({
    ...dateFilterFields,
    status: z.enum(WAGE_STATUS).optional(),
  })
  .superRefine(assertDateRangeComplete);
