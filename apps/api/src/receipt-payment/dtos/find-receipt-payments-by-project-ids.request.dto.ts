import { IsArray, IsString } from 'class-validator';

export class FindReceiptPaymentsByProjectIdsRequest {
  @IsArray()
  @IsString({ each: true })
  projectIds!: string[];
}
