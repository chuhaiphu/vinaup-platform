import { User } from 'src/prisma/generated/client';

export class TourSettlementCancelLogResponse {
  id!: string;
  tourSettlementId!: string;
  canceledByUserId!: string | null;
  canceledByUser!: User | null;
  snapshotData!: unknown;
  createdAt!: Date;
}
