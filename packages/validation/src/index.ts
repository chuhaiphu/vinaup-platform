// @vinaup-platform/validation — public surface. Exports added per domain as the Zod migration lands.
import { z } from 'zod';

z.config(z.locales.vi());

export { updateFuelPriceSchema } from './zod-schemas/fuel-price.schema';
export type { UpdateFuelPriceRequestInterface } from './interfaces/fuel-price.interface';
