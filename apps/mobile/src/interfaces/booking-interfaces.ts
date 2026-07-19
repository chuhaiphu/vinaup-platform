import { BookingStatus } from '@/constants/booking-constants';

import { BaseMeta } from './_meta-interfaces';
import { OrganizationCustomerResponse } from './organization-customer-interfaces';
import { OrganizationResponse } from './organization-interfaces';
import { TourImplementationResponse } from './tour-implementation-interfaces';
import { UserResponse } from './user-interfaces';

export interface BookingResponse {
  id: string;
  code: string | null;
  description: string;
  content: string | null;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string | null;
  createdBy: UserResponse | null;
  organizationId: string;
  organization: OrganizationResponse;
  organizationCustomerId: string | null;
  organizationCustomer: OrganizationCustomerResponse | null;
  tourImplementationId: string | null;
  tourImplementation: TourImplementationResponse | null;
}

export interface CreateBookingRequest {
  code?: string | null;
  description: string;
  content?: string | null;
  startDate: string;
  endDate: string;
  note?: string | null;
  organizationId: string;
  organizationCustomerId?: string | null;
  tourImplementationId?: string | null;
}

export type UpdateBookingRequest = Partial<CreateBookingRequest>;

export interface BookingMeta extends BaseMeta {
  isSender: boolean;
  isSenderSigned?: boolean;
  isReceiverSigned?: boolean;
}

export type BookingWithMeta = BookingResponse & { meta: BookingMeta };
