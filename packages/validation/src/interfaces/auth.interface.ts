import type { z } from 'zod';

import {
  localSignInSchema,
  requestSignUpOtpSchema,
  signUpSchema,
} from '../zod-schemas/auth.schema';

export type LocalSignInRequestInterface = z.infer<typeof localSignInSchema>;
export type RequestSignUpOtpRequestInterface = z.infer<typeof requestSignUpOtpSchema>;
export type SignUpRequestInterface = z.infer<typeof signUpSchema>;
