import type { z } from 'zod';

import {
  forgotPasswordOtpSchema,
  linkEmailSchema,
  localSignInSchema,
  logoutSchema,
  otpSignInSchema,
  refreshSchema,
  requestLinkEmailSchema,
  requestOtpSignInSchema,
  requestSignUpOtpSchema,
  resetPasswordOtpSchema,
  signUpSchema,
} from '../zod-schemas/auth.schema';

export type ForgotPasswordOtpRequestInterface = z.infer<typeof forgotPasswordOtpSchema>;
export type LinkEmailRequestInterface = z.infer<typeof linkEmailSchema>;
export type LocalSignInRequestInterface = z.infer<typeof localSignInSchema>;
export type LogoutRequestInterface = z.infer<typeof logoutSchema>;
export type OtpSignInRequestInterface = z.infer<typeof otpSignInSchema>;
export type RefreshRequestInterface = z.infer<typeof refreshSchema>;
export type RequestLinkEmailRequestInterface = z.infer<typeof requestLinkEmailSchema>;
export type RequestOtpSignInRequestInterface = z.infer<typeof requestOtpSignInSchema>;
export type RequestSignUpOtpRequestInterface = z.infer<typeof requestSignUpOtpSchema>;
export type ResetPasswordOtpRequestInterface = z.infer<typeof resetPasswordOtpSchema>;
export type SignUpRequestInterface = z.infer<typeof signUpSchema>;
