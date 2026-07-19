import { IsArray, IsInt, IsOptional, IsString, Min, ValidateIf } from 'class-validator';

import { IsStringNotBlank, TrimToUndefined } from 'src/_core/decorators/validation.decorator';

export class CreateUserAssignedRequest {
  // userId, customUserName, customPhone are nullable columns → clearable with null.
  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  userId?: string | null;

  @IsStringNotBlank()
  role!: string;

  @IsStringNotBlank()
  tourImplementationAssignmentId!: string;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  customUserName?: string | null;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  customPhone?: string | null;

  // currentOption (@default) and permissions (@default([])) are NON-nullable: null rejected.
  @IsInt()
  @Min(0)
  @ValidateIf((_, value) => value !== undefined)
  currentOption?: number;

  @IsArray()
  @IsString({ each: true })
  @ValidateIf((_, value) => value !== undefined)
  permissions?: string[];
}
