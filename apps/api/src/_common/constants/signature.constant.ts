export const SIGNATURE_ROLE = {
  SENDER: 'SENDER',
  RECEIVER: 'RECEIVER',
} as const;
export type SignatureRole = (typeof SIGNATURE_ROLE)[keyof typeof SIGNATURE_ROLE];
