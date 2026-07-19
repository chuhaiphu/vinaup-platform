import { IntersectionType } from '@nestjs/mapped-types';
import { IsIn, IsOptional } from 'class-validator';

import { PROJECT_STATUS, type ProjectStatus } from 'src/_common/constants/project.constant';
import { DateFilterParam } from 'src/_common/dtos/param/date-filter-param.dto';
import { IsStringNotBlank, TrimToUndefined } from 'src/_core/decorators/validation.decorator';

export class ProjectTypeFilterParam {
  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  type?: string;
}

export class ProjectStatusFilterParam {
  @TrimToUndefined()
  @IsIn(Object.values(PROJECT_STATUS))
  @IsOptional()
  status?: ProjectStatus;
}

export class ProjectCategoryFilterParam {
  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  categoryId?: string;
}

export class ProjectFilterParam extends IntersectionType(
  DateFilterParam,
  ProjectTypeFilterParam,
  ProjectStatusFilterParam,
  ProjectCategoryFilterParam,
) {}
