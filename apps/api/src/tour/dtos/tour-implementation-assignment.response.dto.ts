import { BaseMeta } from 'src/_common/interfaces/interface';
import { Tour, UserAssignedTourImplementation } from 'src/prisma/generated/client';

export class TourImplementationAssignmentResponse {
  id!: string;
  tourImplementationId!: string;
  carName!: string | null;
  seatCount!: number | null;
  position!: number;
  createdAt!: Date;
  usersAssigned!: UserAssignedTourImplementation[];
}

export type ConflictingTour = Pick<Tour, 'id' | 'description' | 'startDate' | 'endDate'>;

export interface TourImplementationAssignmentMeta extends BaseMeta {
  conflictingToursByUserId: Record<string, ConflictingTour[]>;
}

export type TourImplementationAssignmentWithMeta =
  TourImplementationAssignmentResponse & { meta: TourImplementationAssignmentMeta };
