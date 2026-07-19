import { z } from 'zod';

import { BOOKING_STATUS } from '../constants/booking.constant';
import {
  assertDateRangeComplete,
  dateFilterFields,
  isEndDateOnOrAfterStartDate,
} from './_shared/date-filter.schema';

const bookingFields = z.strictObject({
  code: z.string().trim().min(1).nullish(),
  description: z.string().trim().min(1),
  content: z.string().trim().min(1).nullish(),
  startDate: z.iso.datetime(),
  endDate: z.iso.datetime(),
  note: z.string().trim().min(1).nullish(),
  organizationId: z.string().trim().min(1), // existence is checked in the service, not here
  organizationCustomerId: z.string().trim().min(1).nullish(),
  tourImplementationId: z.string().trim().min(1).nullish(), // existence is checked in the service, not here
});

export const createBookingSchema = bookingFields.refine(isEndDateOnOrAfterStartDate, {
  message: 'endDate must be on or after startDate',
  path: ['endDate'],
});

export const updateBookingSchema = bookingFields.partial().refine(isEndDateOnOrAfterStartDate, {
  message: 'endDate must be on or after startDate',
  path: ['endDate'],
});

export const bookingFilterSchema = z
  .strictObject({
    ...dateFilterFields,
    status: z.enum(BOOKING_STATUS).optional(),
  })
  .superRefine(assertDateRangeComplete);
