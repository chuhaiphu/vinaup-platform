import { Injectable } from '@nestjs/common';
import type {
  CreateOrganizationMemberRequestInterface,
  UpdateOrganizationMemberRequestInterface,
} from '@vinaup-platform/validation';

import {
  OrganizationMemberAlreadyLinkedException,
  OrganizationMemberDeleteForbiddenException,
  OrganizationMemberNotFoundException,
  OrganizationNotFoundException,
  OrganizationRoleNotFoundException,
} from 'src/_common/exceptions/organization.exception';
import { UserNotFoundException } from 'src/_common/exceptions/user.exception';
import { PrismaService } from 'src/prisma/prisma.service';

import { organizationMemberQueryArgs, type OrganizationMemberResponse } from '../dtos/organization-member.response.dto';

@Injectable()
export class OrganizationMemberService {
  constructor(private readonly prismaService: PrismaService) {}

  // Replace the old @IsOrganizationExist / @IsOrganizationRoleExist / @IsUserExist async
  // validators — DB-backed existence rules live in the service (Coding Convention §7.3).
  private async assertMemberRelationsExist(input: {
    organizationId?: string;
    organizationRoleId?: string;
    userId?: string | null;
  }): Promise<void> {
    if (input.organizationId) {
      const organization = await this.prismaService.organization.findUnique({
        where: { id: input.organizationId },
        select: { id: true },
      });
      if (!organization) throw new OrganizationNotFoundException();
    }
    if (input.organizationRoleId) {
      const organizationRole = await this.prismaService.organizationRole.findUnique({
        where: { id: input.organizationRoleId },
        select: { id: true },
      });
      if (!organizationRole) throw new OrganizationRoleNotFoundException();
    }
    if (input.userId) {
      const user = await this.prismaService.user.findUnique({
        where: { id: input.userId },
        select: { id: true },
      });
      if (!user) throw new UserNotFoundException();
    }
  }

  async createOrganizationMember(
    createOrganizationMemberReq: CreateOrganizationMemberRequestInterface,
    currentUserId: string
  ): Promise<OrganizationMemberResponse> {
    await this.assertMemberRelationsExist(createOrganizationMemberReq);

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
        ...organizationMemberQueryArgs,
      });
    return newOrganizationMember;
  }

  async updateOrganizationMember(
    id: string,
    updateOrganizationMemberReq: UpdateOrganizationMemberRequestInterface
  ): Promise<OrganizationMemberResponse> {
    const existingOrganizationMember =
      await this.prismaService.organizationMember.findUnique({
        where: { id },
      });
    if (!existingOrganizationMember) {
      throw new OrganizationMemberNotFoundException();
    }

    await this.assertMemberRelationsExist(updateOrganizationMemberReq);

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
        ...organizationMemberQueryArgs,
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
        ...organizationMemberQueryArgs,
      });
    return organizationMembers;
  }

  async getOrganizationMemberById(id: string): Promise<OrganizationMemberResponse> {
    const organizationMember =
      await this.prismaService.organizationMember.findUnique({
        where: { id },
        ...organizationMemberQueryArgs,
      });

    if (!organizationMember) {
      throw new OrganizationMemberNotFoundException();
    }

    return organizationMember;
  }
}
