import {
  embeddedOrganizationQueryArgs,
  toEmbeddedOrganizationResponse,
  type EmbeddedOrganizationResponse,
} from 'src/organization/dtos/organization.response.dto';
import { Prisma } from 'src/prisma/generated/client';
import type { StorageService } from 'src/storage/storage.service';
import {
  embeddedUserQueryArgs,
  toEmbeddedUserResponse,
  type EmbeddedUserResponse,
} from 'src/user/dtos/user.response.dto';

export const tourQueryArgs = {
  select: {
    id: true,
    code: true,
    description: true,
    startDate: true,
    endDate: true,
    status: true,
    note: true,
    createdAt: true,
    externalOrganizationName: true,
    externalCustomerName: true,
    createdBy: embeddedUserQueryArgs,
    organization: embeddedOrganizationQueryArgs,
    organizationCustomer: true,
    tourCalculation: true,
    tourImplementation: true,
    tourSettlement: true,
  },
} satisfies Prisma.TourDefaultArgs;

type TourPayload = Prisma.TourGetPayload<typeof tourQueryArgs>;
export type TourResponse = Omit<TourPayload, 'createdBy' | 'organization'> & {
  createdBy: EmbeddedUserResponse | null;
  organization: EmbeddedOrganizationResponse | null;
};

export const toTourResponse = (
  tour: TourPayload,
  storageService: StorageService,
): TourResponse => {
  const { createdBy, organization, ...tourRest } = tour;
  return {
    ...tourRest,
    createdBy: createdBy && toEmbeddedUserResponse(createdBy, storageService),
    organization: organization && toEmbeddedOrganizationResponse(organization, storageService),
  };
};
