import { BaseMeta } from 'src/_common/interfaces/interface';
import { Prisma } from 'src/prisma/generated/client';
import type { StorageService } from 'src/storage/storage.service';
import {
  embeddedUserQueryArgs,
  toEmbeddedUserResponse,
  type EmbeddedUserResponse,
} from 'src/user/dtos/user.response.dto';

export type TourCalculationMeta = BaseMeta;

export const tourCalculationQueryArgs = {
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
} satisfies Prisma.TourCalculationDefaultArgs;

type TourCalculationPayload = Prisma.TourCalculationGetPayload<typeof tourCalculationQueryArgs>;
export type TourCalculationResponse = Omit<TourCalculationPayload, 'createdBy'> & {
  createdBy: EmbeddedUserResponse | null;
};

export const toTourCalculationResponse = (
  tourCalculation: TourCalculationPayload,
  storageService: StorageService,
): TourCalculationResponse => {
  const { createdBy, ...tourCalculationRest } = tourCalculation;
  return {
    ...tourCalculationRest,
    createdBy: createdBy && toEmbeddedUserResponse(createdBy, storageService),
  };
};

export type TourCalculationWithMeta = TourCalculationResponse & {
  meta: TourCalculationMeta;
};
