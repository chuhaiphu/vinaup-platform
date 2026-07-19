import {
  IsDateString,
  IsOptional,
} from 'class-validator';

import {
  IsAfterOrEqualStartDate,
  IsStringNotBlank, TrimToUndefined } from 'src/_core/decorators/validation.decorator';

export class CreateTourRequest {
  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  code?: string | null;

  @IsStringNotBlank()
  description!: string;

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
  organizationId!: string;

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
