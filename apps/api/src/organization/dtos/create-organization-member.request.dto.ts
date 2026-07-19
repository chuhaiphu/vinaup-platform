import { IsDateString, IsEmail, IsIn, IsOptional, IsPhoneNumber } from 'class-validator';

import { ORGANIZATION_MEMBER_TYPE, type OrganizationMemberType } from 'src/_common/constants/organization.constant';
import { IsStringNotBlank, TrimToUndefined } from 'src/_core/decorators/validation.decorator';
import { IsOrganizationExist, IsOrganizationRoleExist } from 'src/_core/validators/organization.validator';
import { IsUserExist } from 'src/_core/validators/user.validator';

export class CreateOrganizationMemberRequest {
  @IsStringNotBlank()
  @IsOrganizationExist()
  organizationId!: string;

  @IsStringNotBlank()
  name!: string;

  @IsIn(Object.values(ORGANIZATION_MEMBER_TYPE))
  type!: OrganizationMemberType;

  @IsStringNotBlank()
  @IsPhoneNumber('VN')
  phone!: string;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  address?: string | null;

  @TrimToUndefined()
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @IsStringNotBlank()
  status!: string;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  avatarUrl?: string | null;

  @IsDateString({ strict: true })
  joinedAt!: string;

  @IsStringNotBlank()
  @IsOrganizationRoleExist()
  organizationRoleId!: string;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  @IsUserExist()
  userId?: string | null;
}
