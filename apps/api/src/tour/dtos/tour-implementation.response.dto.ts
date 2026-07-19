import { BaseMeta } from 'src/_common/interfaces/interface';
import {
  Tour,
  MemberAssignedTourImplementation,
  TourImplementationReceiptPayment,
  User,
} from 'src/prisma/generated/client';

import { TourImplementationAssignmentWithMeta } from './tour-implementation-assignment.response.dto';

export type TourImplementationMeta = BaseMeta

export interface TourImplementationResponse {
  id: string;
  adultTicketCount: number;
  childTicketCount: number;
  infantTicketCount: number;
  adultTicketPrice: number;
  childTicketPrice: number;
  taxRate: number;
  advanceAmount: number;
  advanceType: string | null;
  tourGuideAdvanceAmount: number;
  description: string;
  createdBy: User | null;
  tour: Tour;
  membersAssigned: MemberAssignedTourImplementation[];
  tourImplementationAssignments: TourImplementationAssignmentWithMeta[];
  tourImplementationReceiptPayments: TourImplementationReceiptPayment[];
}

export type TourImplementationWithMeta = TourImplementationResponse & {
  meta: TourImplementationMeta;
};
