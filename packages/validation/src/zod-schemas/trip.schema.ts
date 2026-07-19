import { z } from 'zod';

import { TRIP_STATUS } from '../constants/trip.constant';
import {
  assertDateRangeComplete,
  dateFilterFields,
  isEndDateOnOrAfterStartDate,
} from './_shared/date-filter.schema';

const tripFields = z.strictObject({
  code: z.string().trim().min(1).nullish(),
  description: z.string().trim().min(1),
  content: z.string().trim().min(1).nullish(),
  startDate: z.iso.datetime(),
  endDate: z.iso.datetime(),
  // NON-nullable columns with @default(0): omit is allowed (the DB default applies),
  // but an explicit null is rejected — hence .optional(), not .nullish().
  rentalPrice: z.number().optional(),
  taxRate: z.number().optional(),
  commissionRate: z.number().optional(),
  note: z.string().trim().min(1).nullish(),
  organizationId: z.string().trim().min(1), // existence is checked in the service, not here
  organizationCustomerId: z.string().trim().min(1).nullish(),
  externalOrganizationName: z.string().trim().min(1).nullish(),
  externalCustomerName: z.string().trim().min(1).nullish(),
});

export const createTripSchema = tripFields.refine(isEndDateOnOrAfterStartDate, {
  message: 'endDate must be on or after startDate',
  path: ['endDate'],
});

export const updateTripSchema = tripFields
  .partial()
  .extend({
    status: z.enum(TRIP_STATUS).optional(), // update-only field; NOT NULL column → .optional()
  })
  .refine(isEndDateOnOrAfterStartDate, {
    message: 'endDate must be on or after startDate',
    path: ['endDate'],
  });

export const createTripAssignmentSchema = z.strictObject({
  tripId: z.string().trim().min(1), // existence is checked in the service, not here
  note: z.string().trim().min(1).nullish(),
});

export const updateTripAssignmentSchema = z.strictObject({
  carId: z.string().trim().min(1).nullish(),
  organizationMemberIds: z.array(z.string().trim().min(1)).optional(),
  note: z.string().trim().min(1).nullish(),
});

export const tripFilterSchema = z
  .strictObject({
    ...dateFilterFields,
    status: z.enum(TRIP_STATUS).optional(),
  })
  .superRefine(assertDateRangeComplete);
