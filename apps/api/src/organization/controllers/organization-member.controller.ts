import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';

import type {
  AuthenticatedRequest,
  HttpResponse,
} from 'src/_common/interfaces/interface';
import { JwtAuthGuard } from 'src/_core/guards/jwt-auth.guard';

import { CreateOrganizationMemberRequest } from '../dtos/create-organization-member.request.dto';
import { OrganizationMemberResponse } from '../dtos/organization-member.response.dto';
import { UpdateOrganizationMemberRequest } from '../dtos/update-organization-member.request.dto';
import { OrganizationMemberService } from '../services/organization-member.service';

@Controller('organization-member')
export class OrganizationMemberController {
  constructor(
    private readonly organizationMemberService: OrganizationMemberService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('/')
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createOrganizationMemberReq: CreateOrganizationMemberRequest
  ): Promise<HttpResponse<OrganizationMemberResponse>> {
    const data = await this.organizationMemberService.createOrganizationMember(
      createOrganizationMemberReq,
      req.user.userId
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Organization member created successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/')
  async findByOrganizationId(
    @Query('organizationId') organizationId: string
  ): Promise<HttpResponse<OrganizationMemberResponse[]>> {
    const data =
      await this.organizationMemberService.getOrganizationMembersByOrganizationId(
        organizationId
      );
    return {
      statusCode: HttpStatus.OK,
      message: 'Organization members retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async findById(
    @Param('id') id: string
  ): Promise<HttpResponse<OrganizationMemberResponse>> {
    const data = await this.organizationMemberService.getOrganizationMemberById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Organization member retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateOrganizationMemberReq: UpdateOrganizationMemberRequest
  ): Promise<HttpResponse<OrganizationMemberResponse>> {
    const data = await this.organizationMemberService.updateOrganizationMember(
      id,
      updateOrganizationMemberReq
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Organization member updated successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async delete(
    @Param('id') id: string,
    @Body() deleteOrganizationMemberReq: { organizationId: string }
  ): Promise<HttpResponse<void>> {
    await this.organizationMemberService.deleteOrganizationMember(
      id,
      deleteOrganizationMemberReq
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Organization member deleted successfully',
    };
  }
}
