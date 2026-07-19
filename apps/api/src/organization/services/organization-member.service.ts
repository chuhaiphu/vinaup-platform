import { Injectable } from '@nestjs/common';

import { OrganizationMemberAlreadyLinkedException, OrganizationMemberDeleteForbiddenException, OrganizationMemberNotFoundException } from 'src/_common/exceptions/organization.exception';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreateOrganizationMemberRequest } from '../dtos/create-organization-member.request.dto';
import { OrganizationMemberResponse } from '../dtos/organization-member.response.dto';
import { UpdateOrganizationMemberRequest } from '../dtos/update-organization-member.request.dto';

@Injectable()
export class OrganizationMemberService {
  constructor(private readonly prismaService: PrismaService) {}

  async createOrganizationMember(
    createOrganizationMemberReq: CreateOrganizationMemberRequest,
    currentUserId: string
  ): Promise<OrganizationMemberResponse> {
    if (createOrganizationMemberReq.userId) {
      const existingMember = await this.prismaService.organizationMember.findFirst({
        where: {
          organizationId: createOrganizationMemberReq.organizationId,
          userId: createOrganizationMemberReq.userId,
        },
      });
      if (existingMember) {
        throw new OrganizationMemberAlreadyLinkedException();
      }
    }
    const newOrganizationMember =
      await this.prismaService.organizationMember.create({
        data: {
          organizationId: createOrganizationMemberReq.organizationId,
          type: createOrganizationMemberReq.type,
          name: createOrganizationMemberReq.name,
          phone: createOrganizationMemberReq.phone,
          email: createOrganizationMemberReq.email,
          address: createOrganizationMemberReq.address,
          avatarUrl: createOrganizationMemberReq.avatarUrl,
          status: createOrganizationMemberReq.status,
          organizationRoleId: createOrganizationMemberReq.organizationRoleId,
          userId: createOrganizationMemberReq.userId,
          createdByUserId: currentUserId,
          joinedAt: createOrganizationMemberReq.joinedAt,
        },
        include: {
          createdBy: true,
          user: true,
          organization: true,
          organizationRole: true,
        },
      });
    return newOrganizationMember;
  }

  async updateOrganizationMember(
    id: string,
    updateOrganizationMemberReq: UpdateOrganizationMemberRequest
  ): Promise<OrganizationMemberResponse> {
    const existingOrganizationMember =
      await this.prismaService.organizationMember.findUnique({
        where: { id },
      });
    if (!existingOrganizationMember) {
      throw new OrganizationMemberNotFoundException();
    }

    if (updateOrganizationMemberReq.userId) {
      const existingMember = await this.prismaService.organizationMember.findFirst({
        where: {
          organizationId: updateOrganizationMemberReq.organizationId,
          userId: updateOrganizationMemberReq.userId,
        },
      });

      if (
        existingMember &&
        existingMember?.organizationId !==
          updateOrganizationMemberReq.organizationId
      ) {
        throw new OrganizationMemberAlreadyLinkedException();
      }
    }

    const updatedOrganizationMember =
      await this.prismaService.organizationMember.update({
        where: { id },
        data: {
          organizationId: updateOrganizationMemberReq.organizationId,
          type: updateOrganizationMemberReq.type,
          name: updateOrganizationMemberReq.name,
          phone: updateOrganizationMemberReq.phone,
          email: updateOrganizationMemberReq.email,
          address: updateOrganizationMemberReq.address,
          avatarUrl: updateOrganizationMemberReq.avatarUrl,
          status: updateOrganizationMemberReq.status,
          organizationRoleId: updateOrganizationMemberReq.organizationRoleId,
          userId: updateOrganizationMemberReq.userId,
          // ISO string passes straight to Prisma; undefined leaves it unchanged.
          joinedAt: updateOrganizationMemberReq.joinedAt,
        },
        include: {
          createdBy: true,
          user: true,
          organization: true,
          organizationRole: true,
        },
      });
    return updatedOrganizationMember;
  }

  async deleteOrganizationMember(
    id: string,
    deleteOrganizationMemberReq: { organizationId: string }
  ): Promise<void> {
    const existingOrganizationMember =
      await this.prismaService.organizationMember.findUnique({
        where: { id },
      });
    // Null-check first (fail-fast): a missing member is a 404, not a 403 —
    // checking organizationId on a null row would misreport it as Forbidden.
    if (!existingOrganizationMember) {
      throw new OrganizationMemberNotFoundException();
    }
    if (
      existingOrganizationMember.organizationId !==
      deleteOrganizationMemberReq.organizationId
    ) {
      throw new OrganizationMemberDeleteForbiddenException();
    }
    await this.prismaService.$transaction(async (prismaTransaction) => {
      await prismaTransaction.organizationMember.delete({
        where: { id },
      });
    });
  }

  async getOrganizationMembersByOrganizationId(
    organizationId: string
  ): Promise<OrganizationMemberResponse[]> {
    const organizationMembers =
      await this.prismaService.organizationMember.findMany({
        where: { organizationId },
        include: {
          createdBy: true,
          user: true,
          organization: true,
          organizationRole: true,
        },
      });
    return organizationMembers;
  }

  async getOrganizationMemberById(id: string): Promise<OrganizationMemberResponse> {
    const organizationMember =
      await this.prismaService.organizationMember.findUnique({
        where: { id },
        include: {
          createdBy: true,
          user: true,
          organization: true,
          organizationRole: true,
        },
      });

    if (!organizationMember) {
      throw new OrganizationMemberNotFoundException();
    }

    return organizationMember;
  }
}
