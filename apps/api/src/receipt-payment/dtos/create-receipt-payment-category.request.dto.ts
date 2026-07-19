import { IsOptional } from 'class-validator';

import { IsStringNotBlank, TrimToUndefined } from 'src/_core/decorators/validation.decorator';

export class CreateReceiptPaymentCategoryRequest {
  @IsStringNotBlank()
  name!: string;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  description?: string | null;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  organizationId?: string | null;
}
