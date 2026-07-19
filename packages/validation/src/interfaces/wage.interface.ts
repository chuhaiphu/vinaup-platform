import type { z } from 'zod';

import { createWageSchema, updateWageSchema, wageFilterSchema } from '../zod-schemas/wage.schema';

export type CreateWageRequestInterface = z.infer<typeof createWageSchema>;
export type UpdateWageRequestInterface = z.infer<typeof updateWageSchema>;
export type WageFilterRequestInterface = z.infer<typeof wageFilterSchema>;
