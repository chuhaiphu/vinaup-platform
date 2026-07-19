import { IsOptional } from 'class-validator';

import { IsStringNotBlank, TrimToUndefined } from 'src/_core/decorators/validation.decorator';

export class UserFilterParam {
  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  email?: string;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  name?: string;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  phone?: string;
}
