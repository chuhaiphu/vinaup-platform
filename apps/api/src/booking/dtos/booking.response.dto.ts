import type { BaseMeta } from 'src/_common/interfaces/interface';
import { Prisma } from 'src/prisma/generated/client';

export const bookingQueryArgs = {
  include: {
    createdBy: true,
    organization: true,
    organizationCustomer: true,
    tourImplementation: true,
  },
} satisfies Prisma.BookingDefaultArgs;

export type BookingResponse = Prisma.BookingGetPayload<typeof bookingQueryArgs>;

export interface BookingMeta extends BaseMeta {
  isSender?: boolean;
  isSenderSigned?: boolean;
  isReceiverSigned?: boolean;
}

export type BookingWithMeta = BookingResponse & { meta: BookingMeta };
