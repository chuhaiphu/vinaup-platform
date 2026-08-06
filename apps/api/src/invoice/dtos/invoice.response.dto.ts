import {
  embeddedOrganizationQueryArgs,
  toEmbeddedOrganizationResponse,
  type EmbeddedOrganizationResponse,
} from 'src/organization/dtos/organization.response.dto';
import { Prisma } from 'src/prisma/generated/client';
import type { StorageService } from 'src/storage/storage.service';
import {
  toEmbeddedUserResponse,
  embeddedUserQueryArgs,
  type EmbeddedUserResponse,
} from 'src/user/dtos/user.response.dto';

export const invoiceQueryArgs = {
  include: {
    createdBy: embeddedUserQueryArgs,
    organization: embeddedOrganizationQueryArgs,
    organizationCustomer: true,
  },
} satisfies Prisma.InvoiceDefaultArgs;

type InvoicePayload = Prisma.InvoiceGetPayload<typeof invoiceQueryArgs>;
export type InvoiceResponse = Omit<InvoicePayload, 'createdBy' | 'organization'> & {
  createdBy: EmbeddedUserResponse | null;
  organization: EmbeddedOrganizationResponse | null;
};

export const toInvoiceResponse = (
  invoice: InvoicePayload,
  storageService: StorageService,
): InvoiceResponse => {
  const { createdBy, organization, ...invoiceRest } = invoice;
  return {
    ...invoiceRest,
    createdBy: createdBy && toEmbeddedUserResponse(createdBy, storageService),
    organization: organization && toEmbeddedOrganizationResponse(organization, storageService),
  };
};
