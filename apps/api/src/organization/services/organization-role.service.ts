import { Injectable } from '@nestjs/common';

import { ORGANIZATION_ROLE_CODE } from 'src/_common/constants/organization.constant';
import { PrismaService } from 'src/prisma/prisma.service';

import { OrganizationRoleResponse } from '../dtos/organization-role.response.dto';

@Injectable()
export class OrganizationRoleService {
  constructor(private readonly prismaService: PrismaService) {}

  async getOrganizationRolesByOrganizationId(
    organizationId: string
  ): Promise<OrganizationRoleResponse[]> {
    const organizationRoles = await this.prismaService.organizationRole.findMany({
      where: {
        organizationId,
        NOT: { code: ORGANIZATION_ROLE_CODE.OWNER },
      },
      include: {
        organizationRolePermissions: {
          include: {
            organizationPermission: true,
          },
        },
      },
    });
    return organizationRoles;
  }
}
