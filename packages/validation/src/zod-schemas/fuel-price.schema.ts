import { z } from 'zod';

export const updateFuelPriceSchema = z.strictObject({
  electricity: z.number(),
});
