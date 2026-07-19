import { IntersectionType } from '@nestjs/mapped-types';
import { IsIn, IsOptional } from 'class-validator';

import { BOOKING_STATUS, type BookingStatus } from 'src/_common/constants/booking.constant';
import { DateFilterParam } from 'src/_common/dtos/param/date-filter-param.dto';
import { TrimToUndefined } from 'src/_core/decorators/validation.decorator';

export class BookingStatusFilterParam {
  @TrimToUndefined()
  @IsIn(Object.values(BOOKING_STATUS))
  @IsOptional()
  status?: BookingStatus;
}

export class BookingFilterParam extends IntersectionType(
  DateFilterParam,
  BookingStatusFilterParam
) {}
