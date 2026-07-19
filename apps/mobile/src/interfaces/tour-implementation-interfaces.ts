import { TourImplementationAdvanceType } from '@/constants/tour-constants';

import { BaseMeta } from './_meta-interfaces';
import { OrganizationMemberResponse } from './organization-member-interfaces';
import { TourResponse } from './tour-interfaces';
import { UserResponse } from './user-interfaces';

export interface TourImplementationMeta extends BaseMeta {}

export interface UpdateTourImplementationRequest {
  description?: string;
  adultTicketCount?: number;
  childTicketCount?: number;
  infantTicketCount?: number;
  adultTicketPrice?: number;
  childTicketPrice?: number;
  taxRate?: number;
  advanceAmount?: number;
  advanceType?: TourImplementationAdvanceType | null;
  tourGuideAdvanceAmount?: number;
}
export interface TourImplementationResponse {
  id: string;
  adultTicketCount: number;
  childTicketCount: number;
  infantTicketCount: number;
  adultTicketPrice: number;
  childTicketPrice: number;
  taxRate: number;
  advanceAmount: number;
  advanceType: TourImplementationAdvanceType | null;
  tourGuideAdvanceAmount: number;
  description: string;
  createdByUserId: string | null;
  createdBy: UserResponse | null;
  tourId: string;
  tour: TourResponse;
  membersAssigned: MemberAssignedTourImplementationResponse[];
  tourImplementationAssignments: TourImplementationAssignmentWithMeta[];
  tourImplementationReceiptPayments: {
    id: string;
    tourImplementationId: string;
    receiptPaymentId: string;
    groupCode: string;
  }[];
}

export interface CreateMemberAssignedRequest {
  organizationMemberId: string;
  role: string;
}
export interface ManageMembersAssignedRequest {
  organizationMemberIds: string[];
}
export interface MemberAssignedTourImplementationResponse {
  id: string;
  tourImplementationId: string | null;
  organizationMemberId: string | null;
  organizationMember: OrganizationMemberResponse | null;
  role: string;
}

export interface CreateUserAssignedRequest {
  userId?: string | null;
  role: string;
  tourImplementationAssignmentId: string;
  customUserName?: string | null;
  customPhone?: string | null;
  permissions?: string[];
}
export type UpdateUserAssignedRequest = Partial<CreateUserAssignedRequest> & {
  currentOption?: number;
};
export interface UserAssignedTourImplementationResponse {
  id: string;
  userId: string | null;
  role: string;
  tourImplementationAssignmentId: string | null;
  user: UserResponse | null;
  customUserName: string | null;
  customPhone: string | null;
  currentOption: number;
  permissions: string[];
}

export interface UpdateTourImplementationAssignmentRequest {
  carName?: string | null;
  seatCount?: number | null;
  position?: number;
}
export interface TourImplementationAssignmentResponse {
  id: string;
  tourImplementationId: string;
  carName: string | null;
  seatCount: number | null;
  createdAt: string;
  usersAssigned: UserAssignedTourImplementationResponse[];
  position: number;
}

export type ConflictingTour = Pick<TourResponse, 'id' | 'description' | 'startDate' | 'endDate'>;

export interface TourImplementationAssignmentMeta extends BaseMeta {
  conflictingToursByUserId: Record<string, ConflictingTour[]>;
}

export type TourImplementationWithMeta = TourImplementationResponse & {
  meta: TourImplementationMeta;
};

export type MemberAssignedTourImplementationWithMeta = MemberAssignedTourImplementationResponse & {
  meta: TourImplementationMeta;
};

export type TourImplementationAssignmentWithMeta = TourImplementationAssignmentResponse & {
  meta: TourImplementationAssignmentMeta;
};
