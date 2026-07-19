import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

import { IsStringNotBlank, TrimToUndefined } from 'src/_core/decorators/validation.decorator';

import { CreateOrganizationRequest } from './create-organization.request.dto';

// PartialType applies @IsOptional to every field it inherits from the create DTO by default,
// which skips the validation for both `null` and `undefined` values.
// With { skipNullProperties: false }, a `null` value is no longer skipped from validation,
// so an explicit `null` will be validated by the value-validators.
export class UpdateOrganizationRequest extends PartialType(CreateOrganizationRequest, {
  skipNullProperties: false,
}) {
  // `description` is declared only on this update DTO, so PartialType does NOT gate it — it must be
  // gated by hand. @IsOptional() keeps it clearable because `description` is a nullable column.
  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  description?: string | null;
}
