import { IsDateString, IsIn, IsNotEmpty, IsNumber, IsOptional, ValidateIf } from 'class-validator';

import { RECEIPT_PAYMENT_DEPOSIT_TYPE, type ReceiptPaymentDepositType, RECEIPT_PAYMENT_TRANSACTION_TYPE, type ReceiptPaymentTransactionType, RECEIPT_PAYMENT_TYPE, type ReceiptPaymentType } from 'src/_common/constants/receipt-payment.constant';
import { IsStringNotBlank, TrimToUndefined } from 'src/_core/decorators/validation.decorator';
import { IsBookingExist } from 'src/_core/validators/booking.validator';
import { IsCarMaintenanceLogExist } from 'src/_core/validators/car-maintenance-log.validator';
import { IsInvoiceExist } from 'src/_core/validators/invoice.validator';
import { IsOrganizationExist } from 'src/_core/validators/organization.validator';
import { IsProjectExist } from 'src/_core/validators/project.validator';
import { IsTourCalculationExist, IsTourImplementationExist, IsTourSettlementExist } from 'src/_core/validators/tour.validator';
import { IsTripExist } from 'src/_core/validators/trip.validator';
import { IsWageExist } from 'src/_core/validators/wage.validator';

export class CreateReceiptPaymentRequest {
  @IsIn(Object.values(RECEIPT_PAYMENT_TYPE))
  @IsNotEmpty()
  type!: ReceiptPaymentType;

  @IsStringNotBlank()
  description!: string;

  @IsNumber()
  unitPrice!: number;

  @IsStringNotBlank()
  currency!: string;

  @IsIn(Object.values(RECEIPT_PAYMENT_TRANSACTION_TYPE))
  @IsNotEmpty()
  transactionType!: ReceiptPaymentTransactionType;

  @IsDateString({ strict: true })
  transactionDate!: string;

  @IsNumber()
  quantity!: number;

  @IsNumber()
  frequency!: number;

  // vatRate is a NON-nullable column (@default): omit is fine, null rejected.
  @ValidateIf((_, value) => value !== undefined)
  @IsNumber()
  vatRate?: number;

  // depositAmount is a NON-nullable column (@default): omit is fine, null rejected.
  @ValidateIf((_, value) => value !== undefined)
  @IsNumber()
  depositAmount?: number;

  @TrimToUndefined()
  @IsOptional()
  @IsIn(Object.values(RECEIPT_PAYMENT_DEPOSIT_TYPE))
  depositType?: ReceiptPaymentDepositType | null;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  note?: string | null;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  @IsProjectExist()
  projectId?: string | null;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  @IsInvoiceExist()
  invoiceId?: string | null;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  @IsOrganizationExist()
  organizationId?: string | null;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  @IsTourCalculationExist()
  tourCalculationId?: string | null;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  @IsTourImplementationExist()
  tourImplementationId?: string | null;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  @IsTourSettlementExist()
  tourSettlementId?: string | null;

  // groupCode is a transient input (not a ReceiptPayment column) consumed by the service.
  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  groupCode?: string;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  @IsBookingExist()
  bookingId?: string | null;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  @IsWageExist()
  wageId?: string | null;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  categoryId?: string | null;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  @IsCarMaintenanceLogExist()
  carMaintenanceLogId?: string | null;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  @IsTripExist()
  tripId?: string | null;
}
