import { BaseMeta } from 'src/_common/interfaces/interface';
import { Organization, OrganizationCustomer, TourImplementation, User } from 'src/prisma/generated/client';

export class BookingResponse {
  id!: string;
  code!: string | null;
  description!: string;
  content!: string | null;
  startDate!: Date;
  endDate!: Date;
  status!: string;
  note!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  createdBy!: User | null;
  organization!: Organization;
  organizationCustomer!: OrganizationCustomer | null;
  tourImplementation!: TourImplementation | null;
}

export interface BookingMeta extends BaseMeta {
  isSender?: boolean;
  isSenderSigned?: boolean;
  isReceiverSigned?: boolean;
}

export type BookingWithMeta = BookingResponse & { meta: BookingMeta };