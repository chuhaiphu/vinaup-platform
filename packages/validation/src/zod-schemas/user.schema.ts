import { z } from 'zod';


export const updateUserSchema = z.strictObject({
  name: z.string().trim().min(1).optional(),
  province: z.string().trim().min(1).nullish(),
  description: z.string().trim().min(1).nullish(),
  verifiedByUserId: z.string().trim().min(1).nullish(),
});

export const userFilterSchema = z.strictObject({
  email: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).optional(),
  phone: z.string().trim().min(1).optional(),
});
