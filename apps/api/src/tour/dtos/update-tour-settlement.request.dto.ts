import { IsInt, IsNumber, ValidateIf } from 'class-validator';

// All columns are NON-nullable (@default): each field may be omitted, but an explicit
// null must be rejected — hence @ValidateIf(value !== undefined) instead of @IsOptional.
export class UpdateTourSettlementRequest {
  @IsInt()
  @ValidateIf((_, value) => value !== undefined)
  adultTicketCount?: number;

  @IsInt()
  @ValidateIf((_, value) => value !== undefined)
  childTicketCount?: number;

  @IsNumber()
  @ValidateIf((_, value) => value !== undefined)
  adultTicketPrice?: number;

  @IsNumber()
  @ValidateIf((_, value) => value !== undefined)
  childTicketPrice?: number;

  @IsNumber()
  @ValidateIf((_, value) => value !== undefined)
  taxRate?: number;
}
