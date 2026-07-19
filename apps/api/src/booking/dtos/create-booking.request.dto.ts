import { IsDateString, IsOptional } from 'class-validator';

import {
  IsAfterOrEqualStartDate,
  IsStringNotBlank, TrimToUndefined } from 'src/_core/decorators/validation.decorator';
import { IsOrganizationExist } from 'src/_core/validators/organization.validator';
import { IsTourImplementationExist } from 'src/_core/validators/tour.validator';

export class CreateBookingRequest {
  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  code?: string | null;

  @IsStringNotBlank()
  description!: string;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  content?: string | null;

  @IsDateString({ strict: true })
  startDate!: string;

  @IsDateString({ strict: true })
  @IsAfterOrEqualStartDate()
  endDate!: string;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  note?: string | null;

  @IsStringNotBlank()
  @IsOrganizationExist()
  organizationId!: string;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  organizationCustomerId?: string | null;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  @IsTourImplementationExist()
  tourImplementationId?: string | null;
}
