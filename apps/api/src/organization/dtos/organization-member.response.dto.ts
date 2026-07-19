import { Prisma } from 'src/prisma/generated/client';

export const organizationMemberQueryArgs = {
  include: {
    createdBy: true,
    user: true,
    organization: true,
    organizationRole: true,
  },
} satisfies Prisma.OrganizationMemberDefaultArgs;

export type OrganizationMemberResponse = Prisma.OrganizationMemberGetPayload<typeof organizationMemberQueryArgs>;
