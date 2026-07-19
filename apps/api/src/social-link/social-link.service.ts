import { Injectable } from '@nestjs/common';

import { SocialLinkNotFoundException, SocialLinkOwnerRequiredException } from 'src/_common/exceptions/social-link.exception';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreateSocialLinkRequest } from './dtos/create-social-link.request.dto';
import { SocialLinkResponse } from './dtos/social-link.response.dto';
import { UpdateSocialLinkRequest } from './dtos/update-social-link.request.dto';

@Injectable()
export class SocialLinkService {
  constructor(private prismaService: PrismaService) { }

  async createSocialLink(
    createSocialLinkReq: CreateSocialLinkRequest,
    currentUserId: string,
  ): Promise<SocialLinkResponse> {
    this.assertValidOwner(createSocialLinkReq.userId, createSocialLinkReq.organizationId);

    const socialLink = await this.prismaService.socialLink.create({
      data: { ...createSocialLinkReq, createdByUserId: currentUserId },
      include: {
        user: true,
        organization: true,
        createdBy: true,
      },
    });

    return socialLink;
  }

  async updateSocialLink(
    id: string,
    updateSocialLinkReq: UpdateSocialLinkRequest,
  ): Promise<SocialLinkResponse> {
    const existingSocialLink = await this.prismaService.socialLink.findUnique({
      where: { id },
    });

    if (!existingSocialLink) {
      throw new SocialLinkNotFoundException();
    }

    this.assertValidOwner(
      updateSocialLinkReq.userId ?? existingSocialLink.userId,
      updateSocialLinkReq.organizationId ?? existingSocialLink.organizationId,
    );

    const socialLink = await this.prismaService.socialLink.update({
      where: { id },
      data: updateSocialLinkReq,
      include: {
        user: true,
        organization: true,
        createdBy: true,
      },
    });

    return socialLink;
  }

  async deleteSocialLinkById(id: string): Promise<void> {
    const existingSocialLink = await this.prismaService.socialLink.findUnique({
      where: { id },
    });

    if (!existingSocialLink) {
      throw new SocialLinkNotFoundException();
    }

    await this.prismaService.socialLink.delete({
      where: { id },
    });
  }

  async findSocialLinkById(id: string): Promise<SocialLinkResponse> {
    const socialLink = await this.prismaService.socialLink.findUnique({
      where: { id },
      include: {
        user: true,
        organization: true,
        createdBy: true,
      },
    });

    if (!socialLink) {
      throw new SocialLinkNotFoundException();
    }

    return socialLink;
  }

  async findSocialLinksByOrganizationId(
    organizationId: string,
  ): Promise<SocialLinkResponse[]> {
    return this.prismaService.socialLink.findMany({
      where: { organizationId },
      include: {
        user: true,
        organization: true,
        createdBy: true,
      },
    });
  }

  async findSocialLinksByUserId(userId: string): Promise<SocialLinkResponse[]> {
    return this.prismaService.socialLink.findMany({
      where: { userId: userId },
      include: {
        user: true,
        organization: true,
        createdBy: true,
      },
    });
  }

  private assertValidOwner(
    userId?: string | null,
    organizationId?: string | null,
  ): void {
    if (!userId && !organizationId) {
      throw new SocialLinkOwnerRequiredException();
    }
  }
}
