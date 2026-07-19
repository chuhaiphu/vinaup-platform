import { IsDateString, IsOptional } from 'class-validator';

import {
  IsAfterOrEqualStartDate,
  IsStringNotBlank, TrimToUndefined } from 'src/_core/decorators/validation.decorator';
import { IsInvoiceTypeExist } from 'src/_core/validators/invoice.validator';

export class CreateInvoiceRequest {
  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  code?: string | null;

  @IsStringNotBlank()
  description!: string;

  @IsDateString({ strict: true })
  @IsAfterOrEqualStartDate()
  endDate!: string;

  @IsDateString({ strict: true })
  startDate!: string;

  @IsStringNotBlank()
  @IsInvoiceTypeExist()
  invoiceTypeId!: string;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  note?: string | null;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  organizationId?: string | null;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  organizationCustomerId?: string | null;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  externalOrganizationName?: string | null;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  externalCustomerName?: string | null;
}
