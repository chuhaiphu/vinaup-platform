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

export const receiptPaymentQueryArgs = {
  include: {
    createdBy: embeddedUserQueryArgs,
    organization: embeddedOrganizationQueryArgs,
    project: true,
    invoice: true,
    booking: true,
    tourCalculation: true,
    tourImplementationReceiptPayments: true,
    tourSettlement: true,
    wage: true,
    category: true,
    carMaintenanceLog: true,
    trip: true,
  },
} satisfies Prisma.ReceiptPaymentDefaultArgs;

type ReceiptPaymentPayload = Prisma.ReceiptPaymentGetPayload<typeof receiptPaymentQueryArgs>;
export type ReceiptPaymentResponse = Omit<
  ReceiptPaymentPayload,
  'createdBy' | 'organization'
> & {
  createdBy: EmbeddedUserResponse | null;
  organization: EmbeddedOrganizationResponse | null;
};

export const toReceiptPaymentResponse = (
  receiptPayment: ReceiptPaymentPayload,
  storageService: StorageService,
): ReceiptPaymentResponse => {
  const { createdBy, organization, ...receiptPaymentRest } = receiptPayment;
  return {
    ...receiptPaymentRest,
    createdBy: createdBy && toEmbeddedUserResponse(createdBy, storageService),
    organization: organization && toEmbeddedOrganizationResponse(organization, storageService),
  };
};
