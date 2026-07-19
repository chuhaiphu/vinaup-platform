import { Controller, Get, HttpStatus, Param, UseGuards } from '@nestjs/common';

import type { HttpResponse } from 'src/_common/interfaces/interface';
import { JwtAuthGuard } from 'src/_core/guards/jwt-auth.guard';

import { OrganizationRoleResponse } from '../dtos/organization-role.response.dto';
import { OrganizationRoleService } from '../services/organization-role.service';

@Controller('organization-role')
export class OrganizationRoleController {
  constructor(private readonly organizationRoleService: OrganizationRoleService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/by-organization/:organizationId')
  async findByOrganizationId(
    @Param('organizationId') organizationId: string
  ): Promise<HttpResponse<OrganizationRoleResponse[]>> {
    const data =
      await this.organizationRoleService.getOrganizationRolesByOrganizationId(
        organizationId
      );
    return {
      statusCode: HttpStatus.OK,
      message: 'Organization roles retrieved successfully',
      data,
    };
  }
}
