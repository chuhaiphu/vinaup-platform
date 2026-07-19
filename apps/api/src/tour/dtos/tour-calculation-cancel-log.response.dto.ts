import { User } from 'src/prisma/generated/client';

export class TourCalculationCancelLogResponse {
  id!: string;
  tourCalculationId!: string;
  canceledByUserId!: string | null;
  canceledByUser!: User | null;
  snapshotData!: unknown;
  createdAt!: Date;
}
