import { TripStatus } from '@/constants/trip-constants';

import { BaseMeta } from './_meta-interfaces';
import { CarResponse } from './car-interfaces';
import { OrganizationCustomerResponse } from './organization-customer-interfaces';
import { OrganizationResponse } from './organization-interfaces';
import { OrganizationMemberResponse } from './organization-member-interfaces';
import { UserResponse } from './user-interfaces';

export interface TripResponse {
  id: string;
  code: string | null;
  description: string;
  content: string | null;
  startDate: string;
  endDate: string;
  status: TripStatus;
  rentalPrice: number;
  taxRate: number;
  commissionRate: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string | null;
  createdBy: UserResponse | null;
  organizationId: string;
  organization: OrganizationResponse;
  organizationCustomerId: string | null;
  organizationCustomer: OrganizationCustomerResponse | null;
  externalOrganizationName: string | null;
  externalCustomerName: string | null;
  tripAssignments?: TripAssignmentResponse[];
}

export interface CreateTripRequest {
  code?: string | null;
  description: string;
  content?: string | null;
  startDate: string;
  endDate: string;
  rentalPrice?: number;
  taxRate?: number;
  commissionRate?: number;
  note?: string | null;
  organizationId: string;
  organizationCustomerId?: string | null;
  externalOrganizationName?: string | null;
  externalCustomerName?: string | null;
}

export type UpdateTripRequest = Partial<Omit<CreateTripRequest, 'organizationId'>> & {
  status?: TripStatus;
};

export interface TripAssignmentMemberResponse {
  id: string;
  tripAssignmentId: string;
  organizationMemberId: string;
  organizationMember: OrganizationMemberResponse;
}

export interface TripAssignmentResponse {
  id: string;
  tripId: string;
  carId: string | null;
  car: CarResponse | null;
  members: TripAssignmentMemberResponse[];
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ConflictingTrip = Pick<TripResponse, 'id' | 'description' | 'startDate' | 'endDate'>;

export interface TripAssignmentMeta extends BaseMeta {
  carConflictingTrips: ConflictingTrip[];
  conflictingTripsByMemberId: Record<string, ConflictingTrip[]>;
}

export type TripAssignmentWithMeta = TripAssignmentResponse & { meta: TripAssignmentMeta };

export interface CreateTripAssignmentRequest {
  tripId: string;
  note?: string | null;
}

export interface UpdateTripAssignmentRequest {
  // omit = leave unchanged, null = unset the car
  carId?: string | null;
  // replace-set: the full member list to keep (omit = leave unchanged)
  organizationMemberIds?: string[];
  note?: string | null;
}
