import { Prisma } from 'src/prisma/generated/client';

export const socialLinkQueryArgs = {
  include: {
    user: true,
    organization: true,
    createdBy: true,
  },
} satisfies Prisma.SocialLinkDefaultArgs;

export type SocialLinkResponse = Prisma.SocialLinkGetPayload<typeof socialLinkQueryArgs>;
