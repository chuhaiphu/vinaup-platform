import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsNumber, IsOptional, ValidateIf } from 'class-validator';

import { INVOICE_STATUS, type InvoiceStatus } from 'src/_common/constants/invoice.constant';
import { NullToDefault, TrimToUndefined } from 'src/_core/decorators/validation.decorator';

import { CreateInvoiceRequest } from './create-invoice.request.dto';

// PartialType applies @IsOptional to every field it inherits from the create DTO by default,
// which skips the validation for both `null` and `undefined` values.
// With { skipNullProperties: false }, a `null` value is no longer skipped from validation,
// so an explicit `null` will be validated by the value-validators.
export class UpdateInvoiceRequest extends PartialType(CreateInvoiceRequest, {
  skipNullProperties: false,
}) {
  // status is a NON-nullable column: omit is fine, null must be rejected.
  @TrimToUndefined()
  @ValidateIf((_, value) => value !== undefined)
  @IsIn(Object.values(INVOICE_STATUS))
  status?: InvoiceStatus;

  // NON-nullable @default(0) columns: a client-sent null (e.g. NaN serialized to null)
  // is coerced to 0 before validation, never reaching the column as null. @IsOptional
  // only skips the omitted (undefined) case so partial updates stay partial.
  @NullToDefault(0)
  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @NullToDefault(0)
  @IsOptional()
  @IsNumber()
  vatRate?: number;

  @NullToDefault(0)
  @IsOptional()
  @IsNumber()
  surchargeAmount?: number;
}
