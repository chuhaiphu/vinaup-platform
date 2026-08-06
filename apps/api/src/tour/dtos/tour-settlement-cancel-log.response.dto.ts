import { Prisma } from 'src/prisma/generated/client';
import type { StorageService } from 'src/storage/storage.service';
import {
  embeddedUserQueryArgs,
  toEmbeddedUserResponse,
  type EmbeddedUserResponse,
} from 'src/user/dtos/user.response.dto';

export const tourSettlementCancelLogQueryArgs = {
  select: {
    id: true,
    tourSettlementId: true,
    canceledByUserId: true,
    canceledByUser: embeddedUserQueryArgs,
    snapshotData: true,
    createdAt: true,
  },
} satisfies Prisma.TourSettlementCancelLogDefaultArgs;

type TourSettlementCancelLogPayload = Prisma.TourSettlementCancelLogGetPayload<typeof tourSettlementCancelLogQueryArgs>;
export type TourSettlementCancelLogResponse = Omit<TourSettlementCancelLogPayload, 'canceledByUser'> & {
  canceledByUser: EmbeddedUserResponse | null;
};

export const toTourSettlementCancelLogResponse = (
  tourSettlementCancelLog: TourSettlementCancelLogPayload,
  storageService: StorageService,
): TourSettlementCancelLogResponse => {
  const { canceledByUser, ...tourSettlementCancelLogRest } = tourSettlementCancelLog;
  return {
    ...tourSettlementCancelLogRest,
    canceledByUser: canceledByUser && toEmbeddedUserResponse(canceledByUser, storageService),
  };
};
