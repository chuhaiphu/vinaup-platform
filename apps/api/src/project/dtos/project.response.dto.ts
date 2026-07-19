import { Prisma } from 'src/prisma/generated/client';

export const projectQueryArgs = {
  include: {
    createdBy: true,
    organization: true,
    organizationCustomer: true,
    category: true,
  },
} satisfies Prisma.ProjectDefaultArgs;

export type ProjectResponse = Prisma.ProjectGetPayload<typeof projectQueryArgs>;
