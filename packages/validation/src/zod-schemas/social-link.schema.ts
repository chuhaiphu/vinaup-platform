import { z } from 'zod';

import { SOCIAL_LINK_PLATFORM } from '../constants/social-link.constant';

export const createSocialLinkSchema = z.strictObject({
  platform: z.enum(SOCIAL_LINK_PLATFORM),
  url: z.string().trim().min(1),
  description: z.string().trim().min(1).nullish(),
  userId: z.string().trim().min(1).nullish(),
  organizationId: z.string().trim().min(1).nullish(),
});

export const updateSocialLinkSchema = createSocialLinkSchema.partial();
