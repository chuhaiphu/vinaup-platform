import { z } from 'zod';

export const dateInstanceFilterFields = {
  startDate: z.iso.datetime().optional(),
  endDate: z.iso.datetime().optional(),
};

// endDate ≥ startDate compared as instants — shared by every date-range create/update schema;
//  skipped when either side is missing (partial update).
export const isEndDateOnOrAfterStartDate = (value: { startDate?: string; endDate?: string }) =>
  !value.startDate || !value.endDate || new Date(value.startDate) <= new Date(value.endDate);

// The range is both-or-neither
export const isStartDatePresentWhenEndDate = (value: { startDate?: string; endDate?: string }) =>
  !value.endDate || Boolean(value.startDate);

export const isEndDatePresentWhenStartDate = (value: { startDate?: string; endDate?: string }) =>
  !value.startDate || Boolean(value.endDate);
