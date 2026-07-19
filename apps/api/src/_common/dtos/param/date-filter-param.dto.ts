import { IsDateString, IsDefined, ValidateIf } from 'class-validator';

import { TrimToUndefined } from 'src/_core/decorators/validation.decorator';

export class DateFilterParam {
  // Validate only when EITHER field is provided — keeps "both omitted" valid.
  @TrimToUndefined()
  @ValidateIf((o: DateFilterParam) => o.endDate !== undefined || o.startDate !== undefined)
  @IsDefined({ message: 'startDate is required when endDate is provided' })
  @IsDateString({ strict: true })
  startDate?: string;

  @TrimToUndefined()
  @ValidateIf((o: DateFilterParam) => o.startDate !== undefined || o.endDate !== undefined)
  @IsDefined({ message: 'endDate is required when startDate is provided' })
  @IsDateString({ strict: true })
  endDate?: string;
}
