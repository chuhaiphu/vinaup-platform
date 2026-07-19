import { Prisma } from 'src/prisma/generated/client';

export const organizationQueryArgs = {
  include: {
    createdBy: true,
    organizationIndustry: true,
  },
} satisfies Prisma.OrganizationDefaultArgs;

// The member counts are computed server-side, so they extend the derived type.
export type OrganizationResponse = Prisma.OrganizationGetPayload<typeof organizationQueryArgs> & {
  memberCount?: number;
  memberLinkedCount?: number;
};
