import { IsArray, IsDateString, IsIn, IsNumber, IsOptional, IsString, ValidateIf } from 'class-validator';

import { CAR_STATUS } from 'src/_common/constants/car.constant';
import { IsStringNotBlank, TrimToUndefined } from 'src/_core/decorators/validation.decorator';
import { IsOrganizationExist } from 'src/_core/validators/organization.validator';

export class CreateCarRequest {
  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  name?: string | null;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  manufacturer?: string | null;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  model?: string | null;

  @IsOptional()
  @IsNumber()
  seatCount?: number | null;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  category?: string | null;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  description?: string | null;

  // status is a NON-nullable column (@default): omit is fine, null must be rejected.
  @TrimToUndefined()
  @ValidateIf((_, value) => value !== undefined)
  @IsIn(Object.values(CAR_STATUS))
  status?: string;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  featureImageUrl?: string | null;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  youtubeUrl?: string | null;

  // additionalImageUrls is a NON-nullable list column: omit is fine, null must be rejected.
  @ValidateIf((_, value) => value !== undefined)
  @IsArray()
  @IsString({ each: true })
  additionalImageUrls?: string[];

  @IsOptional()
  @IsDateString({ strict: true })
  inServiceDate?: string | null;

  @IsOptional()
  @IsNumber()
  bankMortgageAmount?: number | null;

  @IsOptional()
  @IsNumber()
  fuelConsumption?: number | null;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  fuelType?: string | null;

  @IsOptional()
  @IsDateString({ strict: true })
  inspectionExpiryDate?: string | null;

  @IsOptional()
  @IsDateString({ strict: true })
  roadFeeExpiryDate?: string | null;

  @IsOptional()
  @IsDateString({ strict: true })
  insuranceExpiryDate?: string | null;

  @IsOptional()
  @IsDateString({ strict: true })
  badgeExpiryDate?: string | null;

  @IsStringNotBlank()
  @IsOrganizationExist()
  organizationId!: string;
}
