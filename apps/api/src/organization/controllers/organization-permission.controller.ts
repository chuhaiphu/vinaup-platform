import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';

import type { HttpResponse } from 'src/_common/interfaces/interface';
import { JwtAuthGuard } from 'src/_core/guards/jwt-auth.guard';

import type { OrganizationPermissionCatalogCellResponse } from '../dtos/organization-permission-catalog.response.dto';
import { OrganizationPermissionService } from '../services/organization-permission.service';

@Controller('organization-permission')
export class OrganizationPermissionController {
  constructor(
    private readonly organizationPermissionService: OrganizationPermissionService,
  ) {}

  // Static catalog metadata (identical for every organization) — auth only, no
  // permission gate, same as other fixed vocabularies.
  @UseGuards(JwtAuthGuard)
  @Get('/catalog')
  async getCatalog(): Promise<HttpResponse<OrganizationPermissionCatalogCellResponse[]>> {
    const data = await this.organizationPermissionService.getPermissionCatalog();
    return {
      statusCode: HttpStatus.OK,
      message: 'Organization permission catalog retrieved successfully',
      data,
    };
  }
}
