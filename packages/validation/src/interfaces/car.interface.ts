import type { z } from 'zod';

import {
  carFilterSchema,
  createCarAssignmentSchema,
  createCarSchema,
  updateCarSchema,
} from '../zod-schemas/car.schema';

export type CreateCarRequestInterface = z.infer<typeof createCarSchema>;
export type UpdateCarRequestInterface = z.infer<typeof updateCarSchema>;
export type CreateCarAssignmentRequestInterface = z.infer<typeof createCarAssignmentSchema>;
export type CarFilterRequestInterface = z.infer<typeof carFilterSchema>;
