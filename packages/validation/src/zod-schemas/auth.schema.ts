import { z } from 'zod';

import { OTP_CODE_REGEX, PASSWORD_MIN_LENGTH } from '../constants/auth.constant';
import { normalizeVnPhone, VN_PHONE_REGEX } from '../constants/phone.constant';

const phoneField = z
  .string()
  .trim()
  .regex(VN_PHONE_REGEX, { error: 'Số điện thoại không hợp lệ' })
  .transform(normalizeVnPhone);

// Lowercased before validating.
const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: 'Email không hợp lệ' }));

const otpCodeField = z
  .string()
  .trim()
  .regex(OTP_CODE_REGEX, { error: 'Mã xác thực gồm 6 chữ số' });

const newPasswordField = z
  .string()
  .min(PASSWORD_MIN_LENGTH, { error: `Mật khẩu phải có ít nhất ${PASSWORD_MIN_LENGTH} ký tự` });


const identifierField = z
  .string()
  .trim()
  .min(1, { error: 'Vui lòng nhập số điện thoại hoặc email' })
  .transform((value) =>
    value.includes('@') ? value.toLowerCase() : normalizeVnPhone(value)
  );

export const localSignInSchema = z.strictObject({
  identifier: identifierField,
  password: z.string().min(1, { error: 'Vui lòng nhập mật khẩu' }),
});

export const requestOtpSignInSchema = z.strictObject({
  phone: phoneField,
});

export const otpSignInSchema = z.strictObject({
  phone: phoneField,
  code: otpCodeField,
});

// Optional: mobile sends the token in the body, web keeps it in the `rtk` cookie and posts nothing.
const bodyRefreshTokenField = z.string().trim().min(1).optional();

export const refreshSchema = z.strictObject({ refreshToken: bodyRefreshTokenField });
export const logoutSchema = z.strictObject({ refreshToken: bodyRefreshTokenField });

export const requestLinkEmailSchema = z.strictObject({
  email: emailField,
  // Step-up: the JWT proves a session exists, not that the account owner is the one asking.
  currentPassword: z.string().min(1, { error: 'Vui lòng nhập mật khẩu hiện tại' }),
});

// The address is not resent — it is read off the verification row the code was issued against.
export const linkEmailSchema = z.strictObject({
  code: otpCodeField,
});

export const forgotPasswordOtpSchema = z.strictObject({
  email: emailField,
});

// `email` scopes the lookup to one user: a 6-digit code is not unique across accounts.
export const resetPasswordOtpSchema = z.strictObject({
  email: emailField,
  code: otpCodeField,
  newPassword: newPasswordField,
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
