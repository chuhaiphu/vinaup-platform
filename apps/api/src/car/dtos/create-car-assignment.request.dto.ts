import { IsArray, IsDateString, IsOptional, ValidateIf } from 'class-validator';

import { IsStringNotBlank, TrimToUndefined } from 'src/_core/decorators/validation.decorator';

export class CreateCarAssignmentRequest {
  @IsStringNotBlank()
  carId!: string;

  // ─── Reconcile target: the FULL desired ACTIVE member set for the car ───
  // Allowed to be empty on purpose: an empty array means "unassign everyone" —
  @IsArray()
  @IsStringNotBlank({ each: true })
  organizationMemberIds!: string[];

  // startTime is a NON-nullable column (@default(now())): omit is fine, null rejected.
  @TrimToUndefined()
  @ValidateIf((_, value) => value !== undefined)
  @IsDateString({ strict: true })
  startTime?: string;

  // note is a nullable column → clearable with null.
  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  note?: string | null;
}
