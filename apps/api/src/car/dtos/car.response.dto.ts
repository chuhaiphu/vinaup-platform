import { CarOperationalStatus } from 'src/_common/constants/car.constant';
import type { BaseMeta } from 'src/_common/interfaces/interface';
import { Prisma } from 'src/prisma/generated/client';

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
  },
} satisfies Prisma.CarDefaultArgs;

export type CarResponse = Prisma.CarGetPayload<typeof carQueryArgs>;

export interface CarMeta extends BaseMeta {
  operationalStatus: CarOperationalStatus;
}

export type CarWithMeta = CarResponse & { meta: CarMeta };
