import { BaseMeta } from './_meta-interfaces';
import { ReceiptPaymentResponse } from './receipt-payment-interfaces';
import { SignatureResponse } from './signature-interfaces';
import { TourResponse, TourCancelLogtourCancelLogSnapshot } from './tour-interfaces';
import { UserResponse } from './user-interfaces';

export type { UpdateTourCalculationRequestInterface as UpdateTourCalculationRequest } from '@vinaup-platform/validation';

export interface TourCalculationMeta extends BaseMeta {}

export type TourCalculationWithMeta = TourCalculationResponse & {
  meta: TourCalculationMeta;
};

export interface TourCalculationResponse {
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

export interface TourCalculationCancelLogSnapshot {
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

export interface TourCalculationCancelLogSnapshotData {
  tourCalculation: TourCalculationCancelLogSnapshot;
  signatures: SignatureResponse[];
}

export interface TourCalculationCancelLogResponse {
  id: string;
  tourCalculationId: string;
  canceledByUserId: string | null;
  canceledByUser: UserResponse | null;
  snapshotData: TourCalculationCancelLogSnapshotData;
  createdAt: string;
}
