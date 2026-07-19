import type { z } from 'zod';

import {
  createTourSchema,
  createUserAssignedSchema,
  manageMembersAssignedSchema,
  tourFilterSchema,
  updateTourCalculationSchema,
  updateTourImplementationAssignmentSchema,
  updateTourImplementationSchema,
  updateTourSchema,
  updateTourSettlementSchema,
  updateUserAssignedSchema,
} from '../zod-schemas/tour.schema';

export type CreateTourRequestInterface = z.infer<typeof createTourSchema>;
export type UpdateTourRequestInterface = z.infer<typeof updateTourSchema>;
export type CreateUserAssignedRequestInterface = z.infer<typeof createUserAssignedSchema>;
export type UpdateUserAssignedRequestInterface = z.infer<typeof updateUserAssignedSchema>;
export type ManageMembersAssignedRequestInterface = z.infer<typeof manageMembersAssignedSchema>;
export type UpdateTourCalculationRequestInterface = z.infer<typeof updateTourCalculationSchema>;
export type UpdateTourSettlementRequestInterface = z.infer<typeof updateTourSettlementSchema>;
export type UpdateTourImplementationRequestInterface = z.infer<typeof updateTourImplementationSchema>;
export type UpdateTourImplementationAssignmentRequestInterface = z.infer<typeof updateTourImplementationAssignmentSchema>;
export type TourFilterRequestInterface = z.infer<typeof tourFilterSchema>;
