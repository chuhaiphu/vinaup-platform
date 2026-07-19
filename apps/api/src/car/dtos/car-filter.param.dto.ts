import { IntersectionType } from '@nestjs/mapped-types';
import { IsIn, IsOptional } from 'class-validator';

import { CAR_STATUS } from 'src/_common/constants/car.constant';
import { DateFilterParam } from 'src/_common/dtos/param/date-filter-param.dto';
import { IsStringNotBlank, TrimToUndefined } from 'src/_core/decorators/validation.decorator';

export class CarNameFilterParam {
  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  name?: string;

  @TrimToUndefined()
  @IsOptional()
  @IsIn(Object.values(CAR_STATUS))
  status?: string;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  category?: string;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  fuelType?: string;
}

export class CarFilterParam extends IntersectionType(
  DateFilterParam,
  CarNameFilterParam
) {}
