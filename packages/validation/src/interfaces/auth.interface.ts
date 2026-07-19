import type { z } from 'zod';

import { localSignInSchema, updateAuthSecretSchema } from '../zod-schemas/auth.schema';

export type LocalSignInRequestInterface = z.infer<typeof localSignInSchema>;
export type UpdateAuthSecretRequestInterface = z.infer<typeof updateAuthSecretSchema>;
