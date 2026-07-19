import { IsArray, IsOptional, ValidateIf } from 'class-validator';

import { IsStringNotBlank, TrimToUndefined } from 'src/_core/decorators/validation.decorator';

export class UpdateTripAssignmentRequest {
  // carId is a nullable column → @IsOptional: omit = leave unchanged, null = unset the car.
  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  carId?: string | null;

  @ValidateIf((_, value) => value !== undefined)
  @IsArray()
  @IsStringNotBlank({ each: true })
  organizationMemberIds?: string[];

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  note?: string | null;
}
