import { Prisma } from 'src/prisma/generated/client';
import type { StorageService } from 'src/storage/storage.service';
import {
  embeddedUserQueryArgs,
  toEmbeddedUserResponse,
  type EmbeddedUserResponse,
} from 'src/user/dtos/user.response.dto';

export const tourCalculationCancelLogQueryArgs = {
  select: {
    id: true,
    tourCalculationId: true,
    canceledByUserId: true,
    canceledByUser: embeddedUserQueryArgs,
    snapshotData: true,
    createdAt: true,
  },
} satisfies Prisma.TourCalculationCancelLogDefaultArgs;

type TourCalculationCancelLogPayload = Prisma.TourCalculationCancelLogGetPayload<typeof tourCalculationCancelLogQueryArgs>;
export type TourCalculationCancelLogResponse = Omit<TourCalculationCancelLogPayload, 'canceledByUser'> & {
  canceledByUser: EmbeddedUserResponse | null;
};

export const toTourCalculationCancelLogResponse = (
  tourCalculationCancelLog: TourCalculationCancelLogPayload,
  storageService: StorageService,
): TourCalculationCancelLogResponse => {
  const { canceledByUser, ...tourCalculationCancelLogRest } = tourCalculationCancelLog;
  return {
    ...tourCalculationCancelLogRest,
    canceledByUser: canceledByUser && toEmbeddedUserResponse(canceledByUser, storageService),
  };
};
