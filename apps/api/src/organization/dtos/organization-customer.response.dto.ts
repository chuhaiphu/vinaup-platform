import { Prisma } from 'src/prisma/generated/client';
import type { StorageService } from 'src/storage/storage.service';
import {
  toEmbeddedUserResponse,
  embeddedUserQueryArgs,
  type EmbeddedUserResponse,
} from 'src/user/dtos/user.response.dto';

import {
  embeddedOrganizationQueryArgs,
  toEmbeddedOrganizationResponse,
  type EmbeddedOrganizationResponse,
} from './organization.response.dto';

export const organizationCustomerQueryArgs = {
  include: {
    createdBy: embeddedUserQueryArgs,
    clientUser: embeddedUserQueryArgs,
    clientOrganization: embeddedOrganizationQueryArgs,
    organization: embeddedOrganizationQueryArgs,
  },
} satisfies Prisma.OrganizationCustomerDefaultArgs;

type OrganizationCustomerPayload = Prisma.OrganizationCustomerGetPayload<
  typeof organizationCustomerQueryArgs
>;
export type OrganizationCustomerResponse = Omit<
  OrganizationCustomerPayload,
  'createdBy' | 'clientUser' | 'clientOrganization' | 'organization'
> & {
  createdBy: EmbeddedUserResponse | null;
  clientUser: EmbeddedUserResponse | null;
  clientOrganization: EmbeddedOrganizationResponse | null;
  organization: EmbeddedOrganizationResponse;
};

export const toOrganizationCustomerResponse = (
  organizationCustomer: OrganizationCustomerPayload,
  storageService: StorageService,
): OrganizationCustomerResponse => {
  const { createdBy, clientUser, clientOrganization, organization, ...organizationCustomerRest } =
    organizationCustomer;
  return {
    ...organizationCustomerRest,
    createdBy: createdBy && toEmbeddedUserResponse(createdBy, storageService),
    clientUser: clientUser && toEmbeddedUserResponse(clientUser, storageService),
    clientOrganization:
      clientOrganization && toEmbeddedOrganizationResponse(clientOrganization, storageService),
    organization: toEmbeddedOrganizationResponse(organization, storageService),
  };
};
