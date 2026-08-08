import type { z } from 'zod';

import { updateUserSchema, userFilterSchema } from '../zod-schemas/user.schema';

export type UpdateUserRequestInterface = z.infer<typeof updateUserSchema>;
export type UserFilterRequestInterface = z.infer<typeof userFilterSchema>;
