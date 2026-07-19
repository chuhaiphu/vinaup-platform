import type { z } from 'zod';

import { createUserSchema, updateUserSchema, userFilterSchema } from '../zod-schemas/user.schema';

export type CreateUserRequestInterface = z.infer<typeof createUserSchema>;
export type UpdateUserRequestInterface = z.infer<typeof updateUserSchema>;
export type UserFilterRequestInterface = z.infer<typeof userFilterSchema>;
