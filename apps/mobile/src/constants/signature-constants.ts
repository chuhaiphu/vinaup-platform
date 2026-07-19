// Wire enums referenced by shared Zod schemas live in the package (§1.3).
export { DOCUMENT_TYPE } from '@vinaup-platform/validation';
export type { DocumentType } from '@vinaup-platform/validation';

export const SIGNATURE_ROLE = {
  SENDER: 'SENDER',
  RECEIVER: 'RECEIVER',
} as const;
export type SignatureRole = (typeof SIGNATURE_ROLE)[keyof typeof SIGNATURE_ROLE];
