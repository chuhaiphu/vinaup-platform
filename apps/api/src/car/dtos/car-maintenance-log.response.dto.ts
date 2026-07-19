import { Prisma } from 'src/prisma/generated/client';

export const carMaintenanceLogQueryArgs = {
  include: { car: true },
} satisfies Prisma.CarMaintenanceLogDefaultArgs;

export type CarMaintenanceLogResponse = Prisma.CarMaintenanceLogGetPayload<typeof carMaintenanceLogQueryArgs>;
