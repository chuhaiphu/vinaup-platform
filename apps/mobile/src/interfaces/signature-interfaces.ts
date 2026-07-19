import { DocumentType, SignatureRole } from '@/constants/signature-constants';

import { UserResponse } from './user-interfaces';

export type {
  ManageReceiverSignaturesRequestInterface as ManageReceiverSignaturesRequest,
  UpdateSignatureUrlRequestInterface as UpdateSignatureUrlRequest,
} from '@vinaup-platform/validation';

export interface SignatureResponse {
  id: string;
  url?: string | null;
  signatureRole: SignatureRole;
  documentId: string;
  documentType: DocumentType;
  isSigned: boolean;

  // Target user to sign
  targetUserId?: string | null;
  targetUser?: UserResponse | null;
  targetName?: string | null;

  // Actual signer information after signing
  signedByUserId?: string | null;
  signedByUser?: UserResponse | null;
  signedByName?: string | null;
  signedAt?: string | null;

  updatedAt: string;
}
