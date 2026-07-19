import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsInt, IsNumber, ValidateIf } from 'class-validator';

import { TOUR_STATUS, type TourStatus } from 'src/_common/constants/tour.constant';
import { TrimToUndefined } from 'src/_core/decorators/validation.decorator';

import { CreateTourRequest } from './create-tour.request.dto';

// PartialType applies @IsOptional to every field it inherits from the create DTO by default,
// which skips the validation for both `null` and `undefined` values.
// With { skipNullProperties: false }, a `null` value is no longer skipped from validation,
// so an explicit `null` will be validated by the value-validators.
export class UpdateTourRequest extends PartialType(CreateTourRequest, {
  skipNullProperties: false,
}) {
  // status and the ticket count/price columns are NON-nullable: omit is fine, null rejected.
  @TrimToUndefined()
  @ValidateIf((_, value) => value !== undefined)
  @IsIn(Object.values(TOUR_STATUS))
  status?: TourStatus;

  @IsInt()
  @ValidateIf((_, value) => value !== undefined)
  adultTicketCount?: number;

  @IsInt()
  @ValidateIf((_, value) => value !== undefined)
  childTicketCount?: number;

  @IsNumber()
  @ValidateIf((_, value) => value !== undefined)
  adultTicketPrice?: number;

  @IsNumber()
  @ValidateIf((_, value) => value !== undefined)
  childTicketPrice?: number;
}
