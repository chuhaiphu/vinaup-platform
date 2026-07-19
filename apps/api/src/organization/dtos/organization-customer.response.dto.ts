import { Prisma } from 'src/prisma/generated/client';

export const organizationCustomerQueryArgs = {
  include: {
    createdBy: true,
    clientUser: true,
    clientOrganization: true,
    organization: true,
  },
} satisfies Prisma.OrganizationCustomerDefaultArgs;

export type OrganizationCustomerResponse = Prisma.OrganizationCustomerGetPayload<typeof organizationCustomerQueryArgs>;
