import { Prisma } from 'src/prisma/generated/client';

export const organizationRoleQueryArgs = {
  include: {
    organizationRolePermissions: {
      include: {
        organizationPermission: true,
      },
    },
  },
} satisfies Prisma.OrganizationRoleDefaultArgs;

export type OrganizationRoleResponse = Prisma.OrganizationRoleGetPayload<typeof organizationRoleQueryArgs>;
