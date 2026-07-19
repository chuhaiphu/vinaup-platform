import { IntersectionType } from '@nestjs/mapped-types';
import { IsIn, IsOptional } from 'class-validator';

import { TRIP_STATUS, type TripStatus } from 'src/_common/constants/trip.constant';
import { DateFilterParam } from 'src/_common/dtos/param/date-filter-param.dto';
import { TrimToUndefined } from 'src/_core/decorators/validation.decorator';

export class TripStatusFilterParam {
  @TrimToUndefined()
  @IsIn(Object.values(TRIP_STATUS))
  @IsOptional()
  status?: TripStatus;
}

export class TripFilterParam extends IntersectionType(
  DateFilterParam,
  TripStatusFilterParam
) {}
