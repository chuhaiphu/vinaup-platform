import { IntersectionType } from '@nestjs/mapped-types';
import { IsIn, IsOptional } from 'class-validator';

import { TOUR_STATUS, type TourStatus } from 'src/_common/constants/tour.constant';
import { DateFilterParam } from 'src/_common/dtos/param/date-filter-param.dto';
import { TrimToUndefined } from 'src/_core/decorators/validation.decorator';

export class TourStatusFilterParam {
  @TrimToUndefined()
  @IsIn(Object.values(TOUR_STATUS))
  @IsOptional()
  status?: TourStatus;
}

export class TourFilterParam extends IntersectionType(
  DateFilterParam,
  TourStatusFilterParam
) {}
