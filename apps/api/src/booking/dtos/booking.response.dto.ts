import type { BaseMeta } from 'src/_common/interfaces/interface';
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

export const bookingQueryArgs = {
  include: {
    createdBy: embeddedUserQueryArgs,
    organization: embeddedOrganizationQueryArgs,
    organizationCustomer: true,
    tourImplementation: true,
  },
} satisfies Prisma.BookingDefaultArgs;

type BookingPayload = Prisma.BookingGetPayload<typeof bookingQueryArgs>;
export type BookingResponse = Omit<BookingPayload, 'createdBy' | 'organization'> & {
  createdBy: EmbeddedUserResponse | null;
  organization: EmbeddedOrganizationResponse;
};

export const toBookingResponse = (
  booking: BookingPayload,
  storageService: StorageService,
): BookingResponse => {
  const { createdBy, organization, ...bookingRest } = booking;
  return {
    ...bookingRest,
    createdBy: createdBy && toEmbeddedUserResponse(createdBy, storageService),
    organization: toEmbeddedOrganizationResponse(organization, storageService),
  };
};

export interface BookingMeta extends BaseMeta {
  isSender?: boolean;
  isSenderSigned?: boolean;
  isReceiverSigned?: boolean;
}

export type BookingWithMeta = BookingResponse & { meta: BookingMeta };
