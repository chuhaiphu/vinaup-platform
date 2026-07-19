import { User } from 'src/prisma/generated/client';

export interface TourCalculationCancelLogResponse {
  id: string;
  tourCalculationId: string;
  canceledByUserId: string | null;
  canceledByUser: User | null;
  snapshotData: unknown;
  createdAt: Date;
}
