import { IntersectionType } from '@nestjs/mapped-types';
import { IsIn, IsOptional } from 'class-validator';

import { WAGE_STATUS, type WageStatus } from 'src/_common/constants/wage.constant';
import { DateFilterParam } from 'src/_common/dtos/param/date-filter-param.dto';
import { TrimToUndefined } from 'src/_core/decorators/validation.decorator';

export class WageStatusFilterParam {
  @TrimToUndefined()
  @IsIn(Object.values(WAGE_STATUS))
  @IsOptional()
  status?: WageStatus;
}

export class WageFilterParam extends IntersectionType(
  DateFilterParam,
  WageStatusFilterParam,
) {}
