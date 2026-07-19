import { IsDateString, IsNumber, IsOptional, ValidateIf } from 'class-validator';

import {
  IsAfterOrEqualStartDate,
  IsStringNotBlank,
  TrimToUndefined,
} from 'src/_core/decorators/validation.decorator';
import { IsOrganizationExist } from 'src/_core/validators/organization.validator';

export class CreateTripRequest {
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

  // rentalPrice/taxRate/commissionRate map to NON-nullable columns with @default(0):
  // omitting them is allowed (the DB default applies), but an explicit null must be rejected —
  // hence @ValidateIf(value !== undefined) instead of @IsOptional (which would skip null too).
  @IsNumber()
  @ValidateIf((_, value) => value !== undefined)
  rentalPrice?: number;

  @IsNumber()
  @ValidateIf((_, value) => value !== undefined)
  taxRate?: number;

  @IsNumber()
  @ValidateIf((_, value) => value !== undefined)
  commissionRate?: number;

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
  externalOrganizationName?: string | null;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  externalCustomerName?: string | null;
}
