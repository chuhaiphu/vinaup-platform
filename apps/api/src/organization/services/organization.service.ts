import { Injectable } from '@nestjs/common';
import {
  DEFAULT_ROLE_PERMISSIONS,
  type PermissionAction,
  type PermissionResource,
} from '@vinaup-platform/permission';
import type {
  CreateOrganizationRequestInterface,
  UpdateOrganizationRequestInterface,
} from '@vinaup-platform/validation';

import {
  ORGANIZATION_MEMBER_STATUS,
  ORGANIZATION_ROLE_CODE,
  ORGANIZATION_ROLE_DESCRIPTION,
} from 'src/_common/constants/organization.constant';
import { EXTENSION_BY_MIME } from 'src/_common/constants/storage.constant';
import {
  OrganizationNotFoundException,
  OrganizationNotMemberException,
} from 'src/_common/exceptions/organization.exception';
import { UploadFailedException } from 'src/_common/exceptions/storage.exception';
import { PrismaService } from 'src/prisma/prisma.service';
import { StorageService } from 'src/storage/storage.service';

import type { OrganizationAbilityResponse } from '../dtos/organization-ability.response.dto';
import type { OrganizationIndustryResponse } from '../dtos/organization-industry.response.dto';
import {
  organizationQueryArgs,
  toOrganizationResponse,
  type OrganizationResponse,
} from '../dtos/organization.response.dto';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async findOrganizationsByCurrentUser(
    currentUserId: string
  ): Promise<OrganizationResponse[]> {
    const organizations = await this.prismaService.organization.findMany({
      where: {
        OR: [
          { createdByUserId: currentUserId },
          {
            organizationMembers: {
              some: { userId: currentUserId },
            },
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
      ...organizationQueryArgs,
    });

    const organizationsWithCounts = await Promise.all(
      organizations.map(async (org) => {
        const counts = await this.getOrganizationMemberCounts(org.id);
        return { ...toOrganizationResponse(org, this.storageService), ...counts };
      })
    );

    return organizationsWithCounts;
  }

  async findOrganizationById(id: string): Promise<OrganizationResponse> {
    const existingOrganization = await this.prismaService.organization.findUnique({
      where: { id },
      ...organizationQueryArgs,
    });

    if (!existingOrganization) {
      throw new OrganizationNotFoundException();
    }

    const counts = await this.getOrganizationMemberCounts(id);
    return { ...toOrganizationResponse(existingOrganization, this.storageService), ...counts };
  }

  async getMyAbilityInOrganization(
    organizationId: string,
    userId: string,
  ): Promise<OrganizationAbilityResponse> {
    const member = await this.prismaService.organizationMember.findFirst({
      where: { userId, organizationId },
      select: {
        status: true,
        organizationRole: {
          select: {
            code: true,
            organizationRolePermissions: {
              select: {
                organizationPermission: {
                  select: { action: true, resource: true, scope: true },
                },
              },
            },
          },
        },
      },
    });
    if (!member) {
      throw new OrganizationNotMemberException();
    }

    const roleCode = member.organizationRole.code;
    // A LOCKED member is denied every action by the guard — return no permissions so the client
    // hides all action affordances, matching what the server would enforce.
    const permissions: OrganizationAbilityResponse['permissions'] =
      member.status === ORGANIZATION_MEMBER_STATUS.LOCKED
        ? []
        : member.organizationRole.organizationRolePermissions.map((row) => ({
            action: row.organizationPermission.action as PermissionAction,
            resource: row.organizationPermission.resource as PermissionResource,
            scope: row.organizationPermission.scope,
          }));

    return {
      roleCode,
      isOwner: roleCode === ORGANIZATION_ROLE_CODE.OWNER,
      permissions,
    };
  }

  async findOrganizationIndustries(): Promise<OrganizationIndustryResponse[]> {
    return this.prismaService.organizationIndustry.findMany();
  }

  async findAllOrganizations(): Promise<OrganizationResponse[]> {
    const organizations = await this.prismaService.organization.findMany({
      orderBy: { createdAt: 'desc' },
      ...organizationQueryArgs,
    });
    return organizations.map((organization) =>
      toOrganizationResponse(organization, this.storageService),
    );
  }

  async createOrganization(
    createOrganizationReq: CreateOrganizationRequestInterface,
    currentUserId: string
  ): Promise<OrganizationResponse> {
    const currentUser = await this.prismaService.user.findUnique({
      where: { id: currentUserId },
    });

    const newOrganization = await this.prismaService.organization.create({
      data: {
        ...createOrganizationReq,
        createdByUserId: currentUserId,
      },
      ...organizationQueryArgs,
    });

    await this.createDefaultRolesForOrganization(newOrganization.id);

    const ownerRole = await this.prismaService.organizationRole.findUnique({
      where: {
        organizationId_code: {
          organizationId: newOrganization.id,
          code: ORGANIZATION_ROLE_CODE.OWNER,
        },
      },
    });

    await this.prismaService.organizationMember.create({
      data: {
        userId: currentUserId,
        organizationId: newOrganization.id,
        type: 'FULL_TIME',
        name: currentUser?.name || '',
        createdByUserId: currentUserId,
        status: 'ACTIVE',
        email: currentUser?.email,
        phone: currentUser?.phone || '',
        organizationRoleId: ownerRole!.id,
        joinedAt: new Date(),
      },
    });

    await this.prismaService.organizationCustomer.create({
      data: {
        organizationId: newOrganization.id,
        name: 'Khách lẻ',
        phone: newOrganization.phone,
        status: 'ACTIVE',
        joinedAt: new Date(),
        isSystemDefault: true,
        createdByUserId: currentUserId,
      },
    });

    await this.createSocialLinksForOrganization(newOrganization.id, currentUserId);
    await this.createDefaultReceiptPaymentCategoriesForOrganization(newOrganization.id);
    return {
      ...toOrganizationResponse(newOrganization, this.storageService),
      memberCount: 1,
      memberLinkedCount: 1,
    };
  }

  async updateOrganization(
    id: string,
    updateOrganizationReq: UpdateOrganizationRequestInterface
  ): Promise<OrganizationResponse> {
    const existingOrganization = await this.prismaService.organization.findUnique({
      where: { id },
    });

    if (!existingOrganization) {
      throw new OrganizationNotFoundException();
    }

    const updatedOrganization = await this.prismaService.organization.update({
      where: { id },
      data: updateOrganizationReq,
      ...organizationQueryArgs,
    });
    const counts = await this.getOrganizationMemberCounts(id);
    return { ...toOrganizationResponse(updatedOrganization, this.storageService), ...counts };
  }

  async deleteOrganization(id: string): Promise<void> {
    const existingOrganization = await this.prismaService.organization.findUnique({
      where: { id },
    });

    if (!existingOrganization) {
      throw new OrganizationNotFoundException();
    }
    await this.prismaService.organization.delete({
      where: { id },
    });
  }

  private async getOrganizationMemberCounts(organizationId: string) {
    const [memberCount, memberLinkedCount] = await Promise.all([
      this.prismaService.organizationMember.count({
        where: { organizationId },
      }),
      this.prismaService.organizationMember.count({
        where: { organizationId, userId: { not: null } },
      }),
    ]);
    return { memberCount, memberLinkedCount };
  }

  private async createDefaultRolesForOrganization(organizationId: string) {
    const allPermissions = await this.prismaService.organizationPermission.findMany();

    // Each fresh organization starts from the factory-default matrix (@vinaup-platform/permission):
    // OWNER locked to MANAGE ALL, MEMBER read-only. The owner edits these cells afterwards.
    for (const [code, cells] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
      const permissionIds = cells.map((cell) => {
        const permission = allPermissions.find(
          (p) => p.resource === cell.resource && p.action === cell.action,
        );
        if (!permission) {
          throw new Error(`Missing OrganizationPermission for ${cell.action} ${cell.resource}`);
        }
        return permission.id;
      });

      await this.prismaService.organizationRole.create({
        data: {
          organizationId,
          code,
          description: ORGANIZATION_ROLE_DESCRIPTION[code] ?? code,
          organizationRolePermissions: {
            create: permissionIds.map((organizationPermissionId) => ({
              organizationPermissionId,
            })),
          },
        },
      });
    }
  }

  private async createDefaultReceiptPaymentCategoriesForOrganization(organizationId: string) {
    await this.prismaService.receiptPaymentCategory.createMany({
      data: [
        'Khách sạn', 'Vận chuyển', 'Tham quan & ăn uống', 'Dịch vụ chung',
        'Nhiên liệu & Sạc điện', 'Thay nhớt & Bôi trơn', 'Lọc & Bảo dưỡng định kỳ',
        'Hệ thống phanh', 'Lốp & Bánh xe', 'Làm mát & Điều hoà', 'Điện & Ắc quy',
        'Rửa xe & Vệ sinh', 'Phụ tùng & Sửa chữa', 'Khác',
      ].map((name) => ({
        name,
        organizationId,
        isSystem: true,
      })),
      skipDuplicates: true,
    });
  }

  private async createSocialLinksForOrganization(
    organizationId: string,
    currentUserId: string
  ) {
    const defaultSocialLinks = [
      { platform: 'FACEBOOK', url: '' },
      { platform: 'WHATSAPP', url: '' },
      { platform: 'ZALO', url: '' },
    ];
    for (const link of defaultSocialLinks) {
      await this.prismaService.socialLink.create({
        data: {
          platform: link.platform,
          url: link.url,
          organizationId,
          createdByUserId: currentUserId,
        },
      });
      await new Promise((resolve) => setTimeout(resolve, 1));
    }
  }

  async updateAvatar(id: string, file: Express.Multer.File): Promise<OrganizationResponse> {
    const existing = await this.prismaService.organization.findUnique({
      where: { id },
      select: { avatarKey: true },
    });
    if (!existing) {
      throw new OrganizationNotFoundException();
    }

    // Server-generated key; the extension comes from the VERIFIED mime type, never from the
    // uploaded filename. → docs/pattern/STORAGE-PATTERN.md
    const extension = EXTENSION_BY_MIME[file.mimetype];
    const avatarKey = `organizations/${id}/logo-${Date.now()}.${extension}`;

    try {
      await this.storageService.put(avatarKey, file.buffer, file.mimetype);
    } catch {
      throw new UploadFailedException();
    }

    const updatedOrganization = await this.prismaService.organization.update({
      where: { id },
      data: { avatarKey },
      ...organizationQueryArgs,
    });

    // Best-effort prune of the previous object — a cleanup failure must NOT fail the request
    if (existing.avatarKey) {
      try {
        await this.storageService.delete(existing.avatarKey);
      } catch {
        // swallow — an orphaned object is a cleanup problem, not a user-facing one
      }
    }

    const counts = await this.getOrganizationMemberCounts(id);
    return { ...toOrganizationResponse(updatedOrganization, this.storageService), ...counts };
  }
}
