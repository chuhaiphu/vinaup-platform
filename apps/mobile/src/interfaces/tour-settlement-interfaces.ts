import { BaseMeta } from './_meta-interfaces';
import { ReceiptPaymentResponse } from './receipt-payment-interfaces';
import { SignatureResponse } from './signature-interfaces';
import { TourResponse, TourCancelLogtourCancelLogSnapshot } from './tour-interfaces';
import { UserResponse } from './user-interfaces';

export interface TourSettlementMeta extends BaseMeta {}

export type TourSettlementWithMeta = TourSettlementResponse & {
  meta: TourSettlementMeta;
};

export interface TourSettlementResponse {
  id: string;
  adultTicketCount: number;
  childTicketCount: number;
  adultTicketPrice: number;
  childTicketPrice: number;
  taxRate: number;
  createdByUserId: string | null;
  createdBy: UserResponse | null;
  tourId: string;
  tour: TourResponse;
}

export interface UpdateTourSettlementRequest {
  adultTicketCount?: number;
  childTicketCount?: number;
  adultTicketPrice?: number;
  childTicketPrice?: number;
  taxRate?: number;
}

export interface TourSettlementCancelLogSnapshot {
  id?: string;
  adultTicketCount?: number;
  childTicketCount?: number;
  adultTicketPrice?: number;
  childTicketPrice?: number;
  taxRate?: number;
  createdByUserId?: string | null;
  tourId?: string;
  createdBy?: UserResponse | null;
  tour?: TourCancelLogtourCancelLogSnapshot;
  receiptPayments?: ReceiptPaymentResponse[];
}

export interface TourSettlementCancelLogSnapshotData {
  tourSettlement: TourSettlementCancelLogSnapshot;
  signatures: SignatureResponse[];
}

export interface TourSettlementCancelLogResponse {
  id: string;
  tourSettlementId: string;
  canceledByUserId: string | null;
  canceledByUser: UserResponse | null;
  snapshotData: TourSettlementCancelLogSnapshotData;
  createdAt: string;
}
