export const TOUR_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type TourStatus = (typeof TOUR_STATUS)[keyof typeof TOUR_STATUS];

export const TOUR_IMPLEMENTATION_ADVANCE_TYPE = {
  CASH: 'CASH',
  BANK: 'BANK',
} as const;

export type TourImplementationAdvanceType = (typeof TOUR_IMPLEMENTATION_ADVANCE_TYPE)[keyof typeof TOUR_IMPLEMENTATION_ADVANCE_TYPE];

