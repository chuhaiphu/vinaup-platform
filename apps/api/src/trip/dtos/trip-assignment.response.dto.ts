import { BaseMeta } from 'src/_common/interfaces/interface';
import { Car, OrganizationMember, Trip, TripAssignmentMember } from 'src/prisma/generated/client';

export class TripAssignmentResponse {
  id!: string;
  tripId!: string;
  carId!: string | null;
  car!: Car | null;
  members!: (TripAssignmentMember & { organizationMember: OrganizationMember })[];
  note!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}

export type ConflictingTrip = Pick<Trip, 'id' | 'description' | 'startDate' | 'endDate'>;

export interface TripAssignmentMeta extends BaseMeta {
  carConflictingTrips: ConflictingTrip[];
  conflictingTripsByMemberId: Record<string, ConflictingTrip[]>;
}

export type TripAssignmentWithMeta = TripAssignmentResponse & { meta: TripAssignmentMeta };
