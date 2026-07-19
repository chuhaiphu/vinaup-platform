import { IsInt, IsOptional, Min, ValidateIf } from 'class-validator';

import { IsStringNotBlank, TrimToUndefined } from 'src/_core/decorators/validation.decorator';

export class UpdateTourImplementationAssignmentRequest {
  // carName and seatCount are nullable columns → @IsOptional keeps them clearable with null.
  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  carName?: string | null;

  @IsInt()
  @Min(1)
  @IsOptional()
  seatCount?: number | null;

  // position is a NON-nullable column: omit is fine, null rejected.
  @IsInt()
  @Min(1)
  @ValidateIf((_, value) => value !== undefined)
  position?: number;
}
