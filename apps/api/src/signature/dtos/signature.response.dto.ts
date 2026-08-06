import { Prisma } from 'src/prisma/generated/client';
import type { StorageService } from 'src/storage/storage.service';
import {
  toEmbeddedUserResponse,
  embeddedUserQueryArgs,
  type EmbeddedUserResponse,
} from 'src/user/dtos/user.response.dto';

export const signatureQueryArgs = {
  select: {
    id: true,
    signatureKey: true,
    signatureRole: true,
    documentId: true,
    documentType: true,
    targetUserId: true,
    targetName: true,
    signedByUserId: true,
    signedByName: true,
    signedAt: true,
    isSigned: true,
    updatedAt: true,
    targetUser: embeddedUserQueryArgs,
    signedByUser: embeddedUserQueryArgs,
  },
} satisfies Prisma.SignatureDefaultArgs;

// DB holds `signatureKey`; the wire exposes `signatureUrl` (StorageService.getPublicUrl).
type SignaturePayload = Prisma.SignatureGetPayload<typeof signatureQueryArgs>;
export type SignatureResponse = Omit<
  SignaturePayload,
  'signatureKey' | 'targetUser' | 'signedByUser'
> & {
  signatureUrl: string | null;
  targetUser: EmbeddedUserResponse | null;
  signedByUser: EmbeddedUserResponse | null;
};

export const toSignatureResponse = (
  signature: SignaturePayload,
  storageService: StorageService,
): SignatureResponse => {
  const { signatureKey, targetUser, signedByUser, ...signatureRest } = signature;
  return {
    ...signatureRest,
    signatureUrl: signatureKey ? storageService.getPublicUrl(signatureKey) : null,
    targetUser: targetUser && toEmbeddedUserResponse(targetUser, storageService),
    signedByUser: signedByUser && toEmbeddedUserResponse(signedByUser, storageService),
  };
};
