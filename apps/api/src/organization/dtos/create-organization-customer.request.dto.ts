import { IsDateString, IsEmail, IsOptional, IsPhoneNumber } from 'class-validator';

import { IsStringNotBlank, TrimToUndefined } from 'src/_core/decorators/validation.decorator';
import { IsOrganizationExist } from 'src/_core/validators/organization.validator';

export class CreateOrganizationCustomerRequest {
  @IsStringNotBlank()
  @IsOrganizationExist()
  organizationId!: string;

  @IsStringNotBlank()
  name!: string;

  @IsStringNotBlank()
  @IsPhoneNumber('VN')
  phone!: string;

  @TrimToUndefined()
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @IsStringNotBlank()
  status!: string;

  @IsDateString({ strict: true })
  joinedAt!: string;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  clientUserId?: string | null;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  @IsOrganizationExist()
  clientOrganizationId?: string | null;
}
