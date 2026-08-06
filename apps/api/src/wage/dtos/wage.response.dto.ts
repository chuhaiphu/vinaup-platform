import { Prisma } from 'src/prisma/generated/client';
import type { StorageService } from 'src/storage/storage.service';
import {
  toEmbeddedUserResponse,
  embeddedUserQueryArgs,
  type EmbeddedUserResponse,
} from 'src/user/dtos/user.response.dto';

export const wageQueryArgs = {
  include: { createdBy: embeddedUserQueryArgs },
} satisfies Prisma.WageDefaultArgs;

type WagePayload = Prisma.WageGetPayload<typeof wageQueryArgs>;
export type WageResponse = Omit<WagePayload, 'createdBy'> & {
  createdBy: EmbeddedUserResponse | null;
};

export const toWageResponse = (
  wage: WagePayload,
  storageService: StorageService,
): WageResponse => {
  const { createdBy, ...wageRest } = wage;
  return {
    ...wageRest,
    createdBy: createdBy && toEmbeddedUserResponse(createdBy, storageService),
  };
};
