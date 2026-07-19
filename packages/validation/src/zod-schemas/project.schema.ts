import { z } from 'zod';

import { PROJECT_STATUS } from '../constants/project.constant';
import {
  assertDateRangeComplete,
  dateFilterFields,
  isEndDateOnOrAfterStartDate,
} from './_shared/date-filter.schema';

const projectFields = z.strictObject({
  code: z.string().trim().min(1).nullish(),
  type: z.string().trim().min(1).nullish(),
  description: z.string().trim().min(1),
  endDate: z.iso.datetime(),
  startDate: z.iso.datetime(),
  note: z.string().trim().min(1).nullish(),
  organizationId: z.string().trim().min(1).nullish(),
  organizationCustomerId: z.string().trim().min(1).nullish(),
  externalOrganizationName: z.string().trim().min(1).nullish(),
  externalCustomerName: z.string().trim().min(1).nullish(),
  categoryId: z.string().trim().min(1).nullish(),
});

export const createProjectSchema = projectFields.refine(isEndDateOnOrAfterStartDate, {
  message: 'endDate must be on or after startDate',
  path: ['endDate'],
});

export const updateProjectSchema = projectFields
  .partial()
  .extend({
    status: z.enum(PROJECT_STATUS).optional(), // update-only field; NOT NULL column → .optional()
  })
  .refine(isEndDateOnOrAfterStartDate, {
    message: 'endDate must be on or after startDate',
    path: ['endDate'],
  });

export const createProjectCategorySchema = z.strictObject({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1).nullish(),
  organizationId: z.string().trim().min(1).nullish(),
});

export const updateProjectCategorySchema = createProjectCategorySchema.partial();

export const projectFilterSchema = z
  .strictObject({
    ...dateFilterFields,
    type: z.string().trim().min(1).optional(),
    status: z.enum(PROJECT_STATUS).optional(),
    categoryId: z.string().trim().min(1).optional(),
  })
  .superRefine(assertDateRangeComplete);
