import type { BaseMeta } from 'src/_common/interfaces/interface';
import {
  embeddedCarQueryArgs,
  toEmbeddedCarResponse,
  type EmbeddedCarResponse,
} from 'src/car/dtos/car.response.dto';
import {
  embeddedOrganizationMemberQueryArgs,
  toEmbeddedOrganizationMemberResponse,
  type EmbeddedOrganizationMemberResponse,
} from 'src/organization/dtos/organization-member.response.dto';
import { Prisma, Trip } from 'src/prisma/generated/client';
import type { StorageService } from 'src/storage/storage.service';

export const tripAssignmentQueryArgs = {
  include: {
    car: embeddedCarQueryArgs,
    members: { include: { organizationMember: embeddedOrganizationMemberQueryArgs } },
  },
} satisfies Prisma.TripAssignmentDefaultArgs;

type TripAssignmentPayload = Prisma.TripAssignmentGetPayload<typeof tripAssignmentQueryArgs>;
type TripAssignmentMemberPayload = TripAssignmentPayload['members'][number];

export type TripAssignmentResponse = Omit<TripAssignmentPayload, 'car' | 'members'> & {
  car: EmbeddedCarResponse | null;
  members: (Omit<TripAssignmentMemberPayload, 'organizationMember'> & {
    organizationMember: EmbeddedOrganizationMemberResponse;
  })[];
};

export const toTripAssignmentResponse = (
  tripAssignment: TripAssignmentPayload,
  storageService: StorageService,
): TripAssignmentResponse => {
  const { car, members, ...tripAssignmentRest } = tripAssignment;
  return {
    ...tripAssignmentRest,
    car: car && toEmbeddedCarResponse(car, storageService),
    members: members.map((member) => {
      const { organizationMember, ...memberRest } = member;
      return {
        ...memberRest,
        organizationMember: toEmbeddedOrganizationMemberResponse(
          organizationMember,
          storageService,
        ),
      };
    }),
  };
};

export type ConflictingTrip = Pick<Trip, 'id' | 'description' | 'startDate' | 'endDate'>;

export interface TripAssignmentMeta extends BaseMeta {
  carConflictingTrips: ConflictingTrip[];
  conflictingTripsByMemberId: Record<string, ConflictingTrip[]>;
}

export type TripAssignmentWithMeta = TripAssignmentResponse & { meta: TripAssignmentMeta };
