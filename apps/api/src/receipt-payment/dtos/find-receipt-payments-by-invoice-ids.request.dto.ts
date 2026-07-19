import { IsArray, IsString } from 'class-validator';

export class FindReceiptPaymentsByInvoiceIdsRequest {
  @IsArray()
  @IsString({ each: true })
  invoiceIds!: string[];
}
