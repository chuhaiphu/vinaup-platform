import {
  ReceiptPaymentDepositType,
  ReceiptPaymentTransactionType,
  ReceiptPaymentType,
} from '@/constants/receipt-payment-constants';

import { BookingResponse } from './booking-interfaces';
import { CarMaintenanceLogResponse } from './car-interfaces';
import { InvoiceResponse } from './invoice-interfaces';
import { ProjectResponse } from './project-interfaces';
import { TourCalculationResponse } from './tour-calculation-interfaces';
import { TourSettlementResponse } from './tour-settlement-interfaces';
import { TripResponse } from './trip-interfaces';
import { UserResponse } from './user-interfaces';

export type {
  CreateReceiptPaymentCategoryRequestInterface as CreateReceiptPaymentCategoryRequest,
  CreateReceiptPaymentRequestInterface as CreateReceiptPaymentRequest,
  UpdateReceiptPaymentCategoryRequestInterface as UpdateReceiptPaymentCategoryRequest,
  UpdateReceiptPaymentRequestInterface as UpdateReceiptPaymentRequest,
} from '@vinaup-platform/validation';

export interface ReceiptPaymentCategoryResponse {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  userId: string | null;
  organizationId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReceiptPaymentResponse {
  id: string;
  type: ReceiptPaymentType;
  description: string | null;
  unitPrice: number;
  currency: string;
  transactionType: ReceiptPaymentTransactionType;
  transactionDate: string;
  quantity: number;
  frequency: number;
  vatRate: number;
  depositAmount?: number;
  depositType?: ReceiptPaymentDepositType | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string | null;
  createdBy: UserResponse | null;
  projectId: string | null;
  project: ProjectResponse | null;
  organizationId: string | null;
  invoiceId: string | null;
  invoice: InvoiceResponse | null;
  bookingId: string | null;
  booking: BookingResponse | null;
  tourCalculationId: string | null;
  tourCalculation: TourCalculationResponse | null;
  tourSettlementId: string | null;
  tourSettlement: TourSettlementResponse | null;
  tourImplementationReceiptPayments: {
    id: string;
    tourImplementationId: string;
    receiptPaymentId: string;
    groupCode: string;
  }[];
  categoryId: string | null;
  category: ReceiptPaymentCategoryResponse | null;
  carMaintenanceLogId: string | null;
  carMaintenanceLog: CarMaintenanceLogResponse | null;
  wageId: string | null;
  trip: TripResponse | null;
}
