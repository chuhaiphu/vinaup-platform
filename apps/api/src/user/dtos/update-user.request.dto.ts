import { PartialType, OmitType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

import { IsStringNotBlank, TrimToUndefined } from 'src/_core/decorators/validation.decorator';

import { CreateUserRequest } from './create-user.request.dto';

// PartialType applies @IsOptional to every field it inherits from the create DTO by default,
// which skips the validation for both `null` and `undefined` values.
// With { skipNullProperties: false }, a `null` value is no longer skipped from validation,
// so an explicit `null` will be validated by the value-validators.
export class UpdateUserRequest extends PartialType(
  OmitType(CreateUserRequest, ['password'] as const),
  { skipNullProperties: false }
) {
  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  description?: string | null;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  verifiedByUserId?: string | null;
}
