import { z } from 'zod';

import { TOUR_IMPLEMENTATION_ADVANCE_TYPE, TOUR_STATUS } from '../constants/tour.constant';
import {
  dateInstanceFilterFields,
  isEndDateOnOrAfterStartDate,
  isEndDatePresentWhenStartDate,
  isStartDatePresentWhenEndDate,
} from './_shared/date-filter.schema';

const tourFields = z.strictObject({
  code: z.string().trim().min(1).nullish(),
  description: z.string().trim().min(1),
  startDate: z.iso.datetime(),
  endDate: z.iso.datetime(),
  note: z.string().trim().min(1).nullish(),
  organizationId: z.string().trim().min(1),
  organizationCustomerId: z.string().trim().min(1).nullish(),
  externalOrganizationName: z.string().trim().min(1).nullish(),
  externalCustomerName: z.string().trim().min(1).nullish(),
});

export const createTourSchema = tourFields.refine(isEndDateOnOrAfterStartDate, {
  error: 'endDate must be on or after startDate',
  path: ['endDate'],
});

export const updateTourSchema = tourFields
  .partial()
  .extend({
    // status and the ticket count/price columns are NOT NULL: omit is fine, null rejected.
    status: z.enum(TOUR_STATUS).optional(),
    adultTicketCount: z.int().optional(),
    childTicketCount: z.int().optional(),
    adultTicketPrice: z.number().optional(),
    childTicketPrice: z.number().optional(),
  })
  .refine(isEndDateOnOrAfterStartDate, {
    error: 'endDate must be on or after startDate',
    path: ['endDate'],
  });

export const createUserAssignedSchema = z.strictObject({
  userId: z.string().trim().min(1).nullish(),
  role: z.string().trim().min(1),
  tourImplementationAssignmentId: z.string().trim().min(1),
  customUserName: z.string().trim().min(1).nullish(),
  customPhone: z.string().trim().min(1).nullish(),
  // currentOption (@default) and permissions (@default([])) are NOT NULL → .optional()
  currentOption: z.int().min(0).optional(),
  permissions: z.array(z.string()).optional(),
});

export const updateUserAssignedSchema = createUserAssignedSchema.partial();

export const manageMembersAssignedSchema = z.strictObject({
  organizationMemberIds: z.array(z.string()).refine((list) => new Set(list).size === list.length, {
    error: 'organizationMemberIds không được chứa phần tử trùng lặp',
  }),
});

// Shared ticket-adjustment shape: all columns are NOT NULL (@default) — omit is
// allowed, an explicit null is rejected.
const ticketAdjustmentFields = {
  adultTicketCount: z.int().optional(),
  childTicketCount: z.int().optional(),
  adultTicketPrice: z.number().optional(),
  childTicketPrice: z.number().optional(),
  taxRate: z.number().optional(),
};

export const updateTourCalculationSchema = z.strictObject({ ...ticketAdjustmentFields });

export const updateTourSettlementSchema = z.strictObject({ ...ticketAdjustmentFields });

export const updateTourImplementationSchema = z.strictObject({
  description: z.string().trim().min(1).optional(),
  ...ticketAdjustmentFields,
  infantTicketCount: z.int().optional(),
  advanceAmount: z.int().optional(),
  advanceType: z.enum(TOUR_IMPLEMENTATION_ADVANCE_TYPE).nullish(), // nullable column → clearable
  tourGuideAdvanceAmount: z.int().optional(),
});

export const updateTourImplementationAssignmentSchema = z.strictObject({
  carName: z.string().trim().min(1).nullish(),
  seatCount: z.int().min(1).nullish(),
  position: z.int().min(1).optional(), // NOT NULL column → .optional()
});

export const tourFilterSchema = z
  .strictObject({
    ...dateInstanceFilterFields,
    status: z.enum(TOUR_STATUS).optional(),
  })
  .refine(isStartDatePresentWhenEndDate, {
    error: 'startDate is required when endDate is provided',
    path: ['startDate'],
  })
  .refine(isEndDatePresentWhenStartDate, {
    error: 'endDate is required when startDate is provided',
    path: ['endDate'],
  });
