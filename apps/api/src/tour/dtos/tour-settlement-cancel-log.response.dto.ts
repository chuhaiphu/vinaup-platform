import { User } from 'src/prisma/generated/client';

export interface TourSettlementCancelLogResponse {
  id: string;
  tourSettlementId: string;
  canceledByUserId: string | null;
  canceledByUser: User | null;
  snapshotData: unknown;
  createdAt: Date;
}
