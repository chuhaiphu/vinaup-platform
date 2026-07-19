import { IsOptional } from 'class-validator';

import { IsStringNotBlank, TrimToUndefined } from 'src/_core/decorators/validation.decorator';
import { IsTripExist } from 'src/_core/validators/trip.validator';

export class CreateTripAssignmentRequest {
  @IsStringNotBlank()
  @IsTripExist()
  tripId!: string;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  note?: string | null;
}
