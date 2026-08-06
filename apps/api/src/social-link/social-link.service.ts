import { Injectable } from '@nestjs/common';
import type {
  CreateSocialLinkRequestInterface,
  UpdateSocialLinkRequestInterface,
} from '@vinaup-platform/validation';

import { SocialLinkNotFoundException, SocialLinkOwnerRequiredException } from 'src/_common/exceptions/social-link.exception';
import { PrismaService } from 'src/prisma/prisma.service';
import { StorageService } from 'src/storage/storage.service';

import { toSocialLinkResponse, socialLinkQueryArgs, type SocialLinkResponse } from './dtos/social-link.response.dto';

@Injectable()
export class SocialLinkService {
  constructor(
    private prismaService: PrismaService,
    private readonly storageService: StorageService,
  ) { }

  async createSocialLink(
    createSocialLinkReq: CreateSocialLinkRequestInterface,
    currentUserId: string,
  ): Promise<SocialLinkResponse> {
    this.assertValidOwner(createSocialLinkReq.userId, createSocialLinkReq.organizationId);

    const socialLink = await this.prismaService.socialLink.create({
      data: { ...createSocialLinkReq, createdByUserId: currentUserId },
      ...socialLinkQueryArgs,
    });

    return toSocialLinkResponse(socialLink, this.storageService);
  }

  async updateSocialLink(
    id: string,
    updateSocialLinkReq: UpdateSocialLinkRequestInterface,
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
      ...socialLinkQueryArgs,
    });

    return toSocialLinkResponse(socialLink, this.storageService);
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
      ...socialLinkQueryArgs,
    });

    if (!socialLink) {
      throw new SocialLinkNotFoundException();
    }

    return toSocialLinkResponse(socialLink, this.storageService);
  }

  async findSocialLinksByOrganizationId(
    organizationId: string,
  ): Promise<SocialLinkResponse[]> {
    const rows = await this.prismaService.socialLink.findMany({
      where: { organizationId },
      ...socialLinkQueryArgs,
    });

    return rows.map((row) => toSocialLinkResponse(row, this.storageService));
  }

  async findSocialLinksByUserId(userId: string): Promise<SocialLinkResponse[]> {
    const rows = await this.prismaService.socialLink.findMany({
      where: { userId: userId },
      ...socialLinkQueryArgs,
    });

    return rows.map((row) => toSocialLinkResponse(row, this.storageService));
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
