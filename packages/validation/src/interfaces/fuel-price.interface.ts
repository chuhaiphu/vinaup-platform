import type { z } from 'zod';

import { updateFuelPriceSchema } from '../zod-schemas/fuel-price.schema';

export type UpdateFuelPriceRequestInterface = z.infer<typeof updateFuelPriceSchema>;
