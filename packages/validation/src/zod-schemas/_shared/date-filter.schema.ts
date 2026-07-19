import { z } from 'zod';

// Shared date-range filter fields — spread into every list-filter schema so
// `startDate`/`endDate` are declared once (DRY). Mobile serializes both with
// `.toISOString()`, hence `z.iso.datetime()` (UTC instant, not a calendar day).
export const dateFilterFields = {
  startDate: z.iso.datetime().optional(),
  endDate: z.iso.datetime().optional(),
};

// endDate ≥ startDate compared as instants — a pure cross-field rule shared by
// every date-range create/update schema; skipped when either side is missing
// (partial update).
export const isEndDateOnOrAfterStartDate = (value: { startDate?: string; endDate?: string }) =>
  !value.startDate || !value.endDate || new Date(value.startDate) <= new Date(value.endDate);

// The range is both-or-neither: an open-ended range is not supported, so each
// end is required as soon as the other is provided.
export const assertDateRangeComplete = (
  value: { startDate?: string; endDate?: string },
  ctx: z.core.$RefinementCtx,
): void => {
  if (value.endDate && !value.startDate) {
    ctx.addIssue({ code: 'custom', path: ['startDate'], message: 'startDate is required when endDate is provided' });
  }
  if (value.startDate && !value.endDate) {
    ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'endDate is required when startDate is provided' });
  }
};
