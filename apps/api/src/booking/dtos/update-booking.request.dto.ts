import { PartialType } from '@nestjs/mapped-types';

import { CreateBookingRequest } from './create-booking.request.dto';

// PartialType applies @IsOptional to every field it inherits from the create DTO by default,
// which skips the validation for both `null` and `undefined` values.
// With { skipNullProperties: false }, a `null` value is no longer skipped from validation,
// so an explicit `null` will be validated by the value-validators.
export class UpdateBookingRequest extends PartialType(CreateBookingRequest, {
  skipNullProperties: false,
}) {}
