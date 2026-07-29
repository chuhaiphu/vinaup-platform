import { CarOperationalStatus } from 'src/_common/constants/car.constant';
import type { BaseMeta } from 'src/_common/interfaces/interface';
import { Prisma } from 'src/prisma/generated/client';

// ─── The trips a car carries: a narrow slice, not the whole trip ─────────────
export const carTripAssignmentQueryArgs = {
  select: {
    id: true,
    tripId: true,
    trip: {
      select: { id: true, description: true, startDate: true, endDate: true },
    },
  },
} satisfies Prisma.TripAssignmentDefaultArgs;

export type CarTripAssignmentResponse = Prisma.TripAssignmentGetPayload<
  typeof carTripAssignmentQueryArgs
>;


export const carQueryArgs = {
  include: {
    createdBy: true,
    organization: true,
    carAssignments: {
      include: {
        organizationMember: {
          include: { user: true },
        },
      },
    },
    carMaintenanceLog: true,
    tripAssignments: carTripAssignmentQueryArgs,
  },
} satisfies Prisma.CarDefaultArgs;

export type CarResponse = Prisma.CarGetPayload<typeof carQueryArgs>;

export interface CarMeta extends BaseMeta {
  operationalStatus: CarOperationalStatus;
}

export type CarWithMeta = CarResponse & { meta: CarMeta };
