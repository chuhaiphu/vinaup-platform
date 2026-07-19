import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';

import type { AuthenticatedRequest, HttpResponse } from 'src/_common/interfaces/interface';
import { JwtAuthGuard } from 'src/_core/guards/jwt-auth.guard';

import { CreateSocialLinkRequest } from './dtos/create-social-link.request.dto';
import { SocialLinkResponse } from './dtos/social-link.response.dto';
import { UpdateSocialLinkRequest } from './dtos/update-social-link.request.dto';
import { SocialLinkService } from './social-link.service';

@Controller('social-link')
export class SocialLinkController {
  constructor(private readonly socialLinkService: SocialLinkService) { }

  @UseGuards(JwtAuthGuard)
  @Post('/')
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createSocialLinkReq: CreateSocialLinkRequest,
  ): Promise<HttpResponse<SocialLinkResponse>> {
    const data = await this.socialLinkService.createSocialLink(createSocialLinkReq, req.user.userId);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Social link created successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateSocialLinkReq: UpdateSocialLinkRequest,
  ): Promise<HttpResponse<SocialLinkResponse>> {
    const data = await this.socialLinkService.updateSocialLink(id, updateSocialLinkReq);
    return {
      statusCode: HttpStatus.OK,
      message: 'Social link updated successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async delete(
    @Param('id') id: string,
  ): Promise<HttpResponse<null>> {
    await this.socialLinkService.deleteSocialLinkById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Social link deleted successfully',
      data: null,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/organization/:organizationId')
  async findByOrganizationId(
    @Param('organizationId') organizationId: string,
  ): Promise<HttpResponse<SocialLinkResponse[]>> {
    const data = await this.socialLinkService.findSocialLinksByOrganizationId(organizationId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Social links retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/user/:userId')
  async findByUserId(
    @Param('userId') userId: string,
  ): Promise<HttpResponse<SocialLinkResponse[]>> {
    const data = await this.socialLinkService.findSocialLinksByUserId(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Social links retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async findById(
    @Param('id') id: string,
  ): Promise<HttpResponse<SocialLinkResponse>> {
    const data = await this.socialLinkService.findSocialLinkById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Social link retrieved successfully',
      data,
    };
  }
}
