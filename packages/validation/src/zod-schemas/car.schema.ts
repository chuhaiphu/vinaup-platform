import { z } from 'zod';

import { CAR_STATUS } from '../constants/car.constant';
import {
  dateInstanceFilterFields,
  isEndDatePresentWhenStartDate,
  isStartDatePresentWhenEndDate,
} from './_shared/date-filter.schema';

const carFields = z.strictObject({
  name: z.string().trim().min(1).nullish(),
  manufacturer: z.string().trim().min(1).nullish(),
  model: z.string().trim().min(1).nullish(),
  seatCount: z.number().nullish(),
  category: z.string().trim().min(1).nullish(),
  description: z.string().trim().min(1).nullish(),
  status: z.enum(CAR_STATUS).optional(), // NOT NULL column with @default → .optional()
  featureImageUrl: z.string().trim().min(1).nullish(),
  youtubeUrl: z.string().trim().min(1).nullish(),
  additionalImageUrls: z.array(z.string()).optional(), // NOT NULL list column → .optional()
  inServiceDate: z.iso.datetime().nullish(),
  bankMortgageAmount: z.number().nullish(),
  fuelConsumption: z.number().nullish(),
  fuelType: z.string().trim().min(1).nullish(),
  inspectionExpiryDate: z.iso.datetime().nullish(),
  roadFeeExpiryDate: z.iso.datetime().nullish(),
  insuranceExpiryDate: z.iso.datetime().nullish(),
  badgeExpiryDate: z.iso.datetime().nullish(),
});

export const createCarSchema = carFields.extend({
  organizationId: z.string().trim().min(1), // existence is checked in the service, not here
});

// organizationId is create-only — a car never moves between organizations.
export const updateCarSchema = carFields.partial();

export const createCarAssignmentSchema = z.strictObject({
  carId: z.string().trim().min(1), // existence is checked in the service, not here
  // ─── Reconcile target: the FULL desired ACTIVE member set for the car ───
  // Allowed to be empty on purpose: an empty array means "unassign everyone".
  organizationMemberIds: z.array(z.string().trim().min(1)),
  startTime: z.iso.datetime().optional(), // NOT NULL column with @default(now()) → .optional()
  note: z.string().trim().min(1).nullish(),
});

export const carFilterSchema = z
  .strictObject({
    ...dateInstanceFilterFields,
    name: z.string().trim().min(1).optional(),
    status: z.enum(CAR_STATUS).optional(),
    category: z.string().trim().min(1).optional(),
    fuelType: z.string().trim().min(1).optional(),
  })
  .refine(isStartDatePresentWhenEndDate, {
    error: 'startDate is required when endDate is provided',
    path: ['startDate'],
  })
  .refine(isEndDatePresentWhenStartDate, {
    error: 'endDate is required when startDate is provided',
    path: ['endDate'],
  });
