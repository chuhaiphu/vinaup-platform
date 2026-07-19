import { Prisma } from 'src/prisma/generated/client';

export const tripQueryArgs = {
  include: {
    createdBy: true,
    organization: true,
    organizationCustomer: true,
  },
} satisfies Prisma.TripDefaultArgs;

// ─── List variant: embed assignments so each list card can summarise drivers + cars ─────
export const tripListQueryArgs = {
  include: {
    ...tripQueryArgs.include,
    tripAssignments: {
      include: {
        car: true,
        members: { include: { organizationMember: true } },
      },
    },
  },
} satisfies Prisma.TripDefaultArgs;

// Only the list endpoint embeds assignments; detail/create/update omit them, hence optional.
export type TripResponse = Prisma.TripGetPayload<typeof tripQueryArgs> & {
  tripAssignments?: Prisma.TripGetPayload<typeof tripListQueryArgs>['tripAssignments'];
};
