import { Booking, CarMaintenanceLog, Invoice, Project, ReceiptPaymentCategory, TourCalculation, TourImplementationReceiptPayment, TourSettlement, Trip, User, Wage } from 'src/prisma/generated/client';

export class ReceiptPaymentResponse {
  id!: string;
  type!: string;
  description!: string | null;
  unitPrice!: number;
  currency!: string;
  transactionType!: string;
  transactionDate!: Date;
  quantity!: number;
  frequency!: number;
  vatRate!: number;
  depositAmount!: number;
  depositType!: string | null;
  note!: string | null;
  createdBy!: User | null;
  project!: Project | null;
  invoice!: Invoice | null;
  tourCalculation!: TourCalculation | null;
  tourImplementationReceiptPayments!: TourImplementationReceiptPayment[];
  tourSettlement!: TourSettlement | null;
  booking!: Booking | null;
  wage!: Wage | null;
  categoryId!: string | null;
  category!: ReceiptPaymentCategory | null;
  carMaintenanceLogId!: string | null;
  carMaintenanceLog!: CarMaintenanceLog | null;
  trip!: Trip | null;
}
