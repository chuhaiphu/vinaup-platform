import { PartialType } from '@nestjs/mapped-types';
import { IsIn, ValidateIf } from 'class-validator';

import { WAGE_STATUS, type WageStatus } from 'src/_common/constants/wage.constant';
import { TrimToUndefined } from 'src/_core/decorators/validation.decorator';

import { CreateWageRequest } from './create-wage.request.dto';

// PartialType applies @IsOptional to every field it inherits from the create DTO by default,
// which skips the validation for both `null` and `undefined` values.
// With { skipNullProperties: false }, a `null` value is no longer skipped from validation,
// so an explicit `null` will be validated by the value-validators.
export class UpdateWageRequest extends PartialType(CreateWageRequest, {
  skipNullProperties: false,
}) {
  // `status` is declared only on this update DTO, so PartialType does NOT gate it — it must be
  // gated by hand. @ValidateIf(value !== undefined) lets it be omitted but still validates `null`,
  // which is rejected because `status` is a NON-nullable column.
  @TrimToUndefined()
  @ValidateIf((_, value) => value !== undefined)
  @IsIn(Object.values(WAGE_STATUS))
  status?: WageStatus;
}
