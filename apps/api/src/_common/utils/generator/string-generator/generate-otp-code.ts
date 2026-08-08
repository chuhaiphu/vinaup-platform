import { randomInt } from 'node:crypto';

import { OTP_CODE_LENGTH } from '@vinaup-platform/validation';

export const generateOtpCode = (): string =>
  randomInt(0, 10 ** OTP_CODE_LENGTH)
    .toString()
    .padStart(OTP_CODE_LENGTH, '0');
