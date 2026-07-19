import { User } from 'src/prisma/generated/client';

export class SignatureResponse {
  id!: string;
  url?: string | null;
  signatureRole!: string;
  documentId!: string;
  documentType!: string;
  isSigned!: boolean;

  // Target user to sign
  targetUserId?: string | null;
  targetUser?: User | null;
  targetName?: string | null;

  // Actual signer information after signing
  signedByUserId?: string | null;
  signedByUser?: User | null;
  signedByName?: string | null;
  signedAt?: Date | null;

  updatedAt!: Date;
}
