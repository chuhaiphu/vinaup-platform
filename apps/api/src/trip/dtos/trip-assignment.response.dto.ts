import type { BaseMeta } from 'src/_common/interfaces/interface';
import { Prisma, Trip } from 'src/prisma/generated/client';

export const tripAssignmentQueryArgs = {
  include: { car: true, members: { include: { organizationMember: true } } },
} satisfies Prisma.TripAssignmentDefaultArgs;

export type TripAssignmentResponse = Prisma.TripAssignmentGetPayload<typeof tripAssignmentQueryArgs>;

export type ConflictingTrip = Pick<Trip, 'id' | 'description' | 'startDate' | 'endDate'>;

export interface TripAssignmentMeta extends BaseMeta {
  carConflictingTrips: ConflictingTrip[];
  conflictingTripsByMemberId: Record<string, ConflictingTrip[]>;
}

export type TripAssignmentWithMeta = TripAssignmentResponse & { meta: TripAssignmentMeta };
