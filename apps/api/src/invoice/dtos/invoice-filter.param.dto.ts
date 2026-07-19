import { IntersectionType } from '@nestjs/mapped-types';
import { IsIn, IsOptional, IsUUID } from 'class-validator';

import { INVOICE_STATUS, type InvoiceStatus } from 'src/_common/constants/invoice.constant';
import { DateFilterParam } from 'src/_common/dtos/param/date-filter-param.dto';
import { TrimToUndefined } from 'src/_core/decorators/validation.decorator';

export class InvoiceTypeFilterParam {
  @TrimToUndefined()
  @IsUUID()
  @IsOptional()
  invoiceTypeId?: string;
}

export class InvoiceStatusFilterParam {
  @TrimToUndefined()
  @IsIn(Object.values(INVOICE_STATUS))
  @IsOptional()
  status?: InvoiceStatus;
}

export class InvoiceFilterParam extends IntersectionType(
  DateFilterParam,
  InvoiceTypeFilterParam,
  InvoiceStatusFilterParam
) {}
