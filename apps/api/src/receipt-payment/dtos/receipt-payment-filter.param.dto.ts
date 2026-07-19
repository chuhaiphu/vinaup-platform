import { IntersectionType } from '@nestjs/mapped-types';
import { IsIn, IsOptional } from 'class-validator';

import { RECEIPT_PAYMENT_TYPE, type ReceiptPaymentType, RECEIPT_PAYMENT_TRANSACTION_TYPE, type ReceiptPaymentTransactionType } from 'src/_common/constants/receipt-payment.constant';
import { DateFilterParam } from 'src/_common/dtos/param/date-filter-param.dto';
import { TrimToUndefined } from 'src/_core/decorators/validation.decorator';

export class ReceiptPaymentTypeFilterParam {
  @TrimToUndefined()
  @IsIn(Object.values(RECEIPT_PAYMENT_TYPE))
  @IsOptional()
  type?: ReceiptPaymentType;
}

export class ReceiptPaymentTransactionTypeFilterParam {
  @TrimToUndefined()
  @IsIn(Object.values(RECEIPT_PAYMENT_TRANSACTION_TYPE))
  @IsOptional()
  transactionType?: ReceiptPaymentTransactionType;
}

export class ReceiptPaymentFilterParam extends IntersectionType(
  DateFilterParam,
  ReceiptPaymentTypeFilterParam,
  ReceiptPaymentTransactionTypeFilterParam
) {}
