import { IsEmail, IsOptional } from 'class-validator';

import { IsStringNotBlank, TrimToUndefined } from 'src/_core/decorators/validation.decorator';

export class CreateOrganizationRequest {
  @IsStringNotBlank()
  name!: string;

  @TrimToUndefined()
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @IsStringNotBlank()
  phone!: string;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  address?: string | null;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  website?: string | null;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  avatarUrl?: string | null;

  @IsStringNotBlank()
  province!: string;

  @IsStringNotBlank()
  organizationIndustryId!: string;
}
