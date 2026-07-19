import type { z } from 'zod';

import { createSocialLinkSchema, updateSocialLinkSchema } from '../zod-schemas/social-link.schema';

export type CreateSocialLinkRequestInterface = z.infer<typeof createSocialLinkSchema>;
export type UpdateSocialLinkRequestInterface = z.infer<typeof updateSocialLinkSchema>;
