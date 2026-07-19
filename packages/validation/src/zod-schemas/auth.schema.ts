import { z } from 'zod';

export const localSignInSchema = z.strictObject({
  email: z.email({ error: 'Email không hợp lệ' }),
  password: z.string().min(1, { error: 'Vui lòng nhập mật khẩu' }),
});

export const updateAuthSecretSchema = z.strictObject({
  secret: z.string().trim().min(1),
  provider: z.string().trim().min(1),
});
