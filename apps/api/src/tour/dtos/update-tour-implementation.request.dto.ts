import { IsIn, IsInt, IsNumber, IsOptional, ValidateIf } from 'class-validator';

import { TOUR_IMPLEMENTATION_ADVANCE_TYPE, type TourImplementationAdvanceType } from 'src/_common/constants/tour.constant';
import { IsStringNotBlank, TrimToUndefined } from 'src/_core/decorators/validation.decorator';

export class UpdateTourImplementationRequest {
  // description and the count/price columns are NON-nullable: omit is fine, null rejected.
  @TrimToUndefined()
  @ValidateIf((_, value) => value !== undefined)
  @IsStringNotBlank()
  description?: string;

  @IsInt()
  @ValidateIf((_, value) => value !== undefined)
  adultTicketCount?: number;

  @IsInt()
  @ValidateIf((_, value) => value !== undefined)
  childTicketCount?: number;

  @IsInt()
  @ValidateIf((_, value) => value !== undefined)
  infantTicketCount?: number;

  @IsNumber()
  @ValidateIf((_, value) => value !== undefined)
  adultTicketPrice?: number;

  @IsNumber()
  @ValidateIf((_, value) => value !== undefined)
  childTicketPrice?: number;

  @IsNumber()
  @ValidateIf((_, value) => value !== undefined)
  taxRate?: number;

  @IsInt()
  @ValidateIf((_, value) => value !== undefined)
  advanceAmount?: number;

  // advanceType is a nullable column → @IsOptional keeps it clearable with null.
  @TrimToUndefined()
  @IsOptional()
  @IsIn(Object.values(TOUR_IMPLEMENTATION_ADVANCE_TYPE))
  advanceType?: TourImplementationAdvanceType | null;

  @IsInt()
  @ValidateIf((_, value) => value !== undefined)
  tourGuideAdvanceAmount?: number;
}
