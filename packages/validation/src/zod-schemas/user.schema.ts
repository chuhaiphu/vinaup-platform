import { z } from 'zod';

import { VN_PHONE_REGEX } from '../constants/phone.constant';

export const createUserSchema = z.strictObject({
  email: z.email(),
  phone: z.string().trim().regex(VN_PHONE_REGEX).nullish(),
  password: z.string().min(1),
  name: z.string().trim().min(1),
  province: z.string().trim().min(1).nullish(),
  avatarUrl: z.string().trim().min(1).nullish(),
});

export const updateUserSchema = createUserSchema
  .omit({ password: true })
  .partial()
  .extend({
    description: z.string().trim().min(1).nullish(),
    verifiedByUserId: z.string().trim().min(1).nullish(),
  });

export const userFilterSchema = z.strictObject({
  email: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).optional(),
  phone: z.string().trim().min(1).optional(),
});
