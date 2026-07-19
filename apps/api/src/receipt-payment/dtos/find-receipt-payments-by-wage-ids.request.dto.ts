import { IsArray, IsString } from 'class-validator';

export class FindReceiptPaymentsByWageIdsRequest {
  @IsArray()
  @IsString({ each: true })
  wageIds!: string[];
}
