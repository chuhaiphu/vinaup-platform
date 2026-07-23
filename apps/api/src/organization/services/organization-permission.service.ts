import { Injectable } from '@nestjs/common';
import type { PermissionAction } from '@vinaup-platform/permission';

import { PERMISSION_CATALOG_DISPLAY_LIST } from 'src/_common/constants/permission-catalog.constant';
import { PrismaService } from 'src/prisma/prisma.service';

import type { OrganizationPermissionCatalogCellResponse } from '../dtos/organization-permission-catalog.response.dto';

@Injectable()
export class OrganizationPermissionService {
  constructor(private readonly prismaService: PrismaService) {}

  async getPermissionCatalog(): Promise<OrganizationPermissionCatalogCellResponse[]> {
    // The DB rows are the truth for WHICH cells exist; the display list is the truth
    // for labels, grouping, and order. Joining them here keeps the client dumb.
    const permissionRows = await this.prismaService.organizationPermission.findMany({
      select: { resource: true, action: true, scope: true },
    });

    const actionsByCellKeyMap = new Map<string, PermissionAction[]>();
    for (const row of permissionRows) {
      const cellKey = `${row.resource}|${row.scope}`;
      const actions = actionsByCellKeyMap.get(cellKey) ?? [];
      actions.push(row.action as PermissionAction);
      actionsByCellKeyMap.set(cellKey, actions);
    }

    return PERMISSION_CATALOG_DISPLAY_LIST.map((display) => ({
      group: display.group,
      resource: display.resource,
      scope: display.scope,
      label: display.label,
      actions: actionsByCellKeyMap.get(`${display.resource}|${display.scope}`) ?? [],
    })).filter((cell) => cell.actions.length > 0);
  }
}
