export const OTP_CODE_LENGTH = 6;
export const OTP_CODE_REGEX = new RegExp(`^\\d{${OTP_CODE_LENGTH}}$`);

// Length is the only rule: NIST SP 800-63B advises against composition requirements, which push
// users toward predictable variants rather than stronger secrets.
export const PASSWORD_MIN_LENGTH = 8;
