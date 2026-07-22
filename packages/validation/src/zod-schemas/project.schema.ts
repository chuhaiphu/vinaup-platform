import { z } from 'zod';

import { PROJECT_STATUS } from '../constants/project.constant';
import {
  dateInstanceFilterFields,
  isEndDateOnOrAfterStartDate,
  isEndDatePresentWhenStartDate,
  isStartDatePresentWhenEndDate,
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
  error: 'endDate must be on or after startDate',
  path: ['endDate'],
});

export const updateProjectSchema = projectFields
  .partial()
  .extend({
    status: z.enum(PROJECT_STATUS).optional(), // update-only field; NOT NULL column → .optional()
  })
  .refine(isEndDateOnOrAfterStartDate, {
    error: 'endDate must be on or after startDate',
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
    ...dateInstanceFilterFields,
    type: z.string().trim().min(1).optional(),
    status: z.enum(PROJECT_STATUS).optional(),
    categoryId: z.string().trim().min(1).optional(),
  })
  .refine(isStartDatePresentWhenEndDate, {
    error: 'startDate is required when endDate is provided',
    path: ['startDate'],
  })
  .refine(isEndDatePresentWhenStartDate, {
    error: 'endDate is required when startDate is provided',
    path: ['endDate'],
  });
