import { BaseMeta } from 'src/_common/interfaces/interface';
import { Prisma } from 'src/prisma/generated/client';
import type { StorageService } from 'src/storage/storage.service';
import {
  embeddedUserQueryArgs,
  toEmbeddedUserResponse,
  type EmbeddedUserResponse,
} from 'src/user/dtos/user.response.dto';

import {
  memberAssignedTourImplementationQueryArgs,
  toMemberAssignedTourImplementationResponse,
  type MemberAssignedTourImplementationResponse,
} from './member-assigned-tour-implementation.response.dto';
import { TourImplementationAssignmentWithMeta } from './tour-implementation-assignment.response.dto';

export type TourImplementationMeta = BaseMeta;

// Covers only what a single query can produce. `tourImplementationAssignments` is absent on
// purpose: those carry conflict meta computed by TourImplementationAssignmentService, so the
// service composes them onto the mapped result below.
export const tourImplementationQueryArgs = {
  select: {
    id: true,
    adultTicketCount: true,
    childTicketCount: true,
    infantTicketCount: true,
    adultTicketPrice: true,
    childTicketPrice: true,
    taxRate: true,
    advanceAmount: true,
    advanceType: true,
    tourGuideAdvanceAmount: true,
    description: true,
    createdBy: embeddedUserQueryArgs,
    tour: true,
    membersAssigned: memberAssignedTourImplementationQueryArgs,
    tourImplementationReceiptPayments: true,
  },
} satisfies Prisma.TourImplementationDefaultArgs;

type TourImplementationPayload = Prisma.TourImplementationGetPayload<
  typeof tourImplementationQueryArgs
>;

export type TourImplementationResponse = Omit<
  TourImplementationPayload,
  'createdBy' | 'membersAssigned'
> & {
  createdBy: EmbeddedUserResponse | null;
  membersAssigned: MemberAssignedTourImplementationResponse[];
  tourImplementationAssignments: TourImplementationAssignmentWithMeta[];
};

// Returns everything but `tourImplementationAssignments` — the caller adds those.
export const toTourImplementationResponse = (
  tourImplementation: TourImplementationPayload,
  storageService: StorageService,
): Omit<TourImplementationResponse, 'tourImplementationAssignments'> => {
  const { createdBy, membersAssigned, ...tourImplementationRest } = tourImplementation;
  return {
    ...tourImplementationRest,
    createdBy: createdBy && toEmbeddedUserResponse(createdBy, storageService),
    membersAssigned: membersAssigned.map((memberAssigned) =>
      toMemberAssignedTourImplementationResponse(memberAssigned, storageService),
    ),
  };
};

export type TourImplementationWithMeta = TourImplementationResponse & {
  meta: TourImplementationMeta;
};
