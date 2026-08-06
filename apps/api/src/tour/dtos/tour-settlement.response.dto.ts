import { BaseMeta } from 'src/_common/interfaces/interface';
import { Prisma } from 'src/prisma/generated/client';
import type { StorageService } from 'src/storage/storage.service';
import {
  embeddedUserQueryArgs,
  toEmbeddedUserResponse,
  type EmbeddedUserResponse,
} from 'src/user/dtos/user.response.dto';

export type TourSettlementMeta = BaseMeta;

export const tourSettlementQueryArgs = {
  select: {
    id: true,
    adultTicketCount: true,
    childTicketCount: true,
    adultTicketPrice: true,
    childTicketPrice: true,
    taxRate: true,
    createdBy: embeddedUserQueryArgs,
    tour: true,
  },
} satisfies Prisma.TourSettlementDefaultArgs;

type TourSettlementPayload = Prisma.TourSettlementGetPayload<typeof tourSettlementQueryArgs>;
export type TourSettlementResponse = Omit<TourSettlementPayload, 'createdBy'> & {
  createdBy: EmbeddedUserResponse | null;
};

export const toTourSettlementResponse = (
  tourSettlement: TourSettlementPayload,
  storageService: StorageService,
): TourSettlementResponse => {
  const { createdBy, ...tourSettlementRest } = tourSettlement;
  return {
    ...tourSettlementRest,
    createdBy: createdBy && toEmbeddedUserResponse(createdBy, storageService),
  };
};

export type TourSettlementWithMeta = TourSettlementResponse & {
  meta: TourSettlementMeta;
};
