import { Prisma } from 'src/prisma/generated/client';
import type { StorageService } from 'src/storage/storage.service';

import {
  embeddedCarQueryArgs,
  toEmbeddedCarResponse,
  type EmbeddedCarResponse,
} from './car.response.dto';

export const carMaintenanceLogQueryArgs = {
  include: { car: embeddedCarQueryArgs },
} satisfies Prisma.CarMaintenanceLogDefaultArgs;

type CarMaintenanceLogPayload = Prisma.CarMaintenanceLogGetPayload<
  typeof carMaintenanceLogQueryArgs
>;
export type CarMaintenanceLogResponse = Omit<CarMaintenanceLogPayload, 'car'> & {
  car: EmbeddedCarResponse;
};

export const toCarMaintenanceLogResponse = (
  carMaintenanceLog: CarMaintenanceLogPayload,
  storageService: StorageService,
): CarMaintenanceLogResponse => {
  const { car, ...carMaintenanceLogRest } = carMaintenanceLog;
  return {
    ...carMaintenanceLogRest,
    car: toEmbeddedCarResponse(car, storageService),
  };
};
