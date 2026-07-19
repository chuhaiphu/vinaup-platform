import { IsEmail, IsOptional, IsPhoneNumber } from 'class-validator';

import { IsStringNotBlank, TrimToUndefined } from 'src/_core/decorators/validation.decorator';

export class CreateUserRequest {
  @IsEmail()
  email!: string;

  @TrimToUndefined()
  @IsPhoneNumber('VN')
  @IsOptional()
  phone?: string | null;

  @IsStringNotBlank()
  password!: string;

  @IsStringNotBlank()
  name!: string;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  province?: string | null;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  avatarUrl?: string | null;
}
