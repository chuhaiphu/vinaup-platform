import type { z } from 'zod';

import {
  createTripAssignmentSchema,
  createTripSchema,
  tripFilterSchema,
  updateTripAssignmentSchema,
  updateTripSchema,
} from '../zod-schemas/trip.schema';

export type CreateTripRequestInterface = z.infer<typeof createTripSchema>;
export type UpdateTripRequestInterface = z.infer<typeof updateTripSchema>;
export type CreateTripAssignmentRequestInterface = z.infer<typeof createTripAssignmentSchema>;
export type UpdateTripAssignmentRequestInterface = z.infer<typeof updateTripAssignmentSchema>;
export type TripFilterRequestInterface = z.infer<typeof tripFilterSchema>;
