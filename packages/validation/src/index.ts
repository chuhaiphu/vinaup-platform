// @vinaup-platform/validation — public surface. Exports added per domain as the Zod migration lands.
import { z } from 'zod';

z.config(z.locales.vi());

export { VN_PHONE_REGEX } from './constants/phone.constant';
export { DOCUMENT_TYPE } from './constants/signature.constant';
export type { DocumentType } from './constants/signature.constant';
export { SOCIAL_LINK_PLATFORM } from './constants/social-link.constant';
export type { SocialLinkPlatform } from './constants/social-link.constant';

export { updateFuelPriceSchema } from './zod-schemas/fuel-price.schema';
export {
  manageReceiverSignaturesSchema,
  updateSignatureUrlSchema,
} from './zod-schemas/signature.schema';
export { createSocialLinkSchema, updateSocialLinkSchema } from './zod-schemas/social-link.schema';
export { createUserSchema, updateUserSchema, userFilterSchema } from './zod-schemas/user.schema';
export type { UpdateFuelPriceRequestInterface } from './interfaces/fuel-price.interface';
export type {
  ManageReceiverSignaturesRequestInterface,
  UpdateSignatureUrlRequestInterface,
} from './interfaces/signature.interface';
export type {
  CreateSocialLinkRequestInterface,
  UpdateSocialLinkRequestInterface,
} from './interfaces/social-link.interface';
export type {
  CreateUserRequestInterface,
  UpdateUserRequestInterface,
  UserFilterRequestInterface,
} from './interfaces/user.interface';
