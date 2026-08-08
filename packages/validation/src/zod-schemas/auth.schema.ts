import { z } from 'zod';

import { OTP_CODE_REGEX, PASSWORD_MIN_LENGTH } from '../constants/auth.constant';
import { normalizeVnPhone, VN_PHONE_REGEX } from '../constants/phone.constant';

// Normalised here, not in the service: the pipe is global, so declaring the field this way makes
// every route that takes a phone store the one canonical E.164 form.
const phoneField = z
  .string()
  .trim()
  .regex(VN_PHONE_REGEX, { error: 'Số điện thoại không hợp lệ' })
  .transform(normalizeVnPhone);

const otpCodeField = z
  .string()
  .trim()
  .regex(OTP_CODE_REGEX, { error: 'Mã xác thực gồm 6 chữ số' });

const newPasswordField = z
  .string()
  .min(PASSWORD_MIN_LENGTH, { error: `Mật khẩu phải có ít nhất ${PASSWORD_MIN_LENGTH} ký tự` });

export const localSignInSchema = z.strictObject({
  email: z.email({ error: 'Email không hợp lệ' }),
  password: z.string().min(1, { error: 'Vui lòng nhập mật khẩu' }),
});

export const requestSignUpOtpSchema = z.strictObject({
  phone: phoneField,
});

export const signUpSchema = z.strictObject({
  phone: phoneField,
  code: otpCodeField,
  password: newPasswordField,
  name: z.string().trim().min(1, { error: 'Vui lòng nhập họ tên' }),
});
