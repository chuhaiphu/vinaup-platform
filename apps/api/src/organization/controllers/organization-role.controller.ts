import { Controller, Get, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { PERMISSION_ACTION, PERMISSION_RESOURCE } from '@vinaup-platform/permission';

import type { HttpResponse } from 'src/_common/interfaces/interface';
import { CheckAbility } from 'src/_core/decorators/check-ability.decorator';
import { JwtAuthGuard } from 'src/_core/guards/jwt-auth.guard';
import { OrganizationPermissionGuard } from 'src/_core/guards/organization-permission.guard';

import type { OrganizationRoleResponse } from '../dtos/organization-role.response.dto';
import { OrganizationRoleService } from '../services/organization-role.service';

@Controller('organization-role')
export class OrganizationRoleController {
  constructor(private readonly organizationRoleService: OrganizationRoleService) {}

  @UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
  @CheckAbility(PERMISSION_ACTION.READ, PERMISSION_RESOURCE.ORGANIZATION_ROLE)
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
