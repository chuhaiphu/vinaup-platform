// @vinaup-platform/validation — public surface. Exports added per domain as the Zod migration lands.
import { z } from 'zod';

z.config(z.locales.vi());

export { SOCIAL_LINK_PLATFORM } from './constants/social-link.constant';
export type { SocialLinkPlatform } from './constants/social-link.constant';

export { updateFuelPriceSchema } from './zod-schemas/fuel-price.schema';
export { createSocialLinkSchema, updateSocialLinkSchema } from './zod-schemas/social-link.schema';
export type { UpdateFuelPriceRequestInterface } from './interfaces/fuel-price.interface';
export type {
  CreateSocialLinkRequestInterface,
  UpdateSocialLinkRequestInterface,
} from './interfaces/social-link.interface';
