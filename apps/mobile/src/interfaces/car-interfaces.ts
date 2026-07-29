import {
  CarAssignmentEventAction,
  CarOperationalStatus,
  CarStatus,
} from '@/constants/car-constants';

import { OrganizationResponse } from './organization-interfaces';
import { OrganizationMemberResponse } from './organization-member-interfaces';
import { UserResponse } from './user-interfaces';

export type {
  CreateCarAssignmentRequestInterface as CreateCarAssignmentRequest,
  CreateCarRequestInterface as CreateCarRequest,
  UpdateCarRequestInterface as UpdateCarRequest,
} from '@vinaup-platform/validation';

export interface CarMeta {
  canEdit: boolean;
  operationalStatus: CarOperationalStatus;
}

export interface CarResponse {
  id: string;
  name: string | null;
  manufacturer: string | null;
  model: string | null;
  seatCount: number | null;
  category: string | null;
  status: CarStatus;
  description: string | null;
  featureImageUrl: string | null;
  youtubeUrl: string | null;
  additionalImageUrls: string[];
  inServiceDate: string | null;
  bankMortgageAmount: number | null;
  fuelConsumption: number | null;
  fuelType: string | null;
  inspectionExpiryDate: string | null;
  roadFeeExpiryDate: string | null;
  insuranceExpiryDate: string | null;
  badgeExpiryDate: string | null;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string | null;
  createdBy: UserResponse | null;
  organizationId: string;
  organization: OrganizationResponse;
  carAssignments?: CarAssignmentResponse[];
  carMaintenanceLog?: CarMaintenanceLogResponse | null;
  // The trips this car runs on the day being viewed. Optional because a car nested inside a
  // trip/assignment response comes from an endpoint that does not load them.
  tripAssignments?: CarTripAssignmentResponse[];
  meta?: CarMeta;
}

export interface CarTripAssignmentResponse {
  id: string;
  tripId: string;
  trip: {
    id: string;
    description: string;
    startDate: string;
    endDate: string;
  };
}

// Current state only: an in-effect (car, member) pairing. The audit trail of who
// was assigned/unassigned and when lives in CarAssignmentEventResponse.
export interface CarAssignmentResponse {
  id: string;
  carId: string;
  car: CarResponse;
  organizationMemberId: string;
  organizationMember: OrganizationMemberResponse;
  startTime: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

// One append-only history row. memberName/memberAvatarUrl are snapshots taken when
// the event happened, so history stays readable after a member is renamed/deleted.
export interface CarAssignmentEventResponse {
  id: string;
  carId: string;
  operationId: string;
  action: CarAssignmentEventAction;
  organizationMemberId: string | null;
  memberName: string;
  memberAvatarUrl: string | null;
  note: string | null;
  performedAt: string;
  createdAt: string;
}

export interface CarMaintenanceLogResponse {
  id: string;
  carId: string;
  car?: CarResponse;
}
