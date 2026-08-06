export type MailIntent =
  | { kind: 'EMAIL_VERIFICATION_OTP'; code: string }
  | { kind: 'PASSWORD_RESET_OTP'; code: string }
  | { kind: 'PASSWORD_RESET_LINK'; resetUrl: string };

export type PhoneIntent = { kind: 'SIGN_UP_OTP'; code: string } | { kind: 'SIGN_IN_OTP'; code: string };

// `reason` names which of the two parties owns the failure:
//   recipient-unreachable  the person we sent to     → another driver may try
//   sender-unavailable     our account cannot send now (balance, quota, outage) → another may try
//   sender-fault           the request we built is wrong (key, template, payload) → do NOT retry
export type SendOutcome =
  | { delivered: true }
  | { delivered: false; reason: 'recipient-unreachable' | 'sender-unavailable' | 'sender-fault' };
