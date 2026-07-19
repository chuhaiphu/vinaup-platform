import { Prisma } from 'src/prisma/generated/client';

export const signatureQueryArgs = {
  include: {
    targetUser: true,
    signedByUser: true,
  },
} satisfies Prisma.SignatureDefaultArgs;

export type SignatureResponse = Prisma.SignatureGetPayload<typeof signatureQueryArgs>;
