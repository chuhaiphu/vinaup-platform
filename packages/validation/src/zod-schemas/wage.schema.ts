import { z } from 'zod';

import { WAGE_STATUS } from '../constants/wage.constant';
import {
  dateInstanceFilterFields,
  isEndDateOnOrAfterStartDate,
  isEndDatePresentWhenStartDate,
  isStartDatePresentWhenEndDate,
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
  error: 'endDate must be on or after startDate',
  path: ['endDate'],
});

export const updateWageSchema = wageFields
  .partial()
  .extend({
    status: z.enum(WAGE_STATUS).optional(), // update-only field; NOT NULL column → .optional()
  })
  .refine(isEndDateOnOrAfterStartDate, {
    error: 'endDate must be on or after startDate',
    path: ['endDate'],
  });

export const wageFilterSchema = z
  .strictObject({
    ...dateInstanceFilterFields,
    status: z.enum(WAGE_STATUS).optional(),
  })
  .refine(isStartDatePresentWhenEndDate, {
    error: 'startDate is required when endDate is provided',
    path: ['startDate'],
  })
  .refine(isEndDatePresentWhenStartDate, {
    error: 'endDate is required when startDate is provided',
    path: ['endDate'],
  });
