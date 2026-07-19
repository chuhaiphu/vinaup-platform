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

import type {
  AuthenticatedRequest,
  HttpResponse,
} from 'src/_common/interfaces/interface';
import { JwtAuthGuard } from 'src/_core/guards/jwt-auth.guard';

import { CreateOrganizationRequest } from '../dtos/create-organization.request.dto';
import type { OrganizationIndustryResponse } from '../dtos/organization-industry.response.dto';
import type { OrganizationResponse } from '../dtos/organization.response.dto';
import { UpdateOrganizationRequest } from '../dtos/update-organization.request.dto';
import { OrganizationService } from '../services/organization.service';

@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findByCurrentUser(
    @Request() req: AuthenticatedRequest
  ): Promise<HttpResponse<OrganizationResponse[]>> {
    const data = await this.organizationService.findOrganizationsByCurrentUser(
      req.user.userId
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Organizations retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/industries')
  async findIndustries(): Promise<HttpResponse<OrganizationIndustryResponse[]>> {
    const data = await this.organizationService.findOrganizationIndustries();
    return {
      statusCode: HttpStatus.OK,
      message: 'Organization industries retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/all')
  async findAllOrganizations(): Promise<HttpResponse<OrganizationResponse[]>> {
    const data = await this.organizationService.findAllOrganizations();
    return {
      statusCode: HttpStatus.OK,
      message: 'All organizations retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async findById(
    @Param('id') id: string
  ): Promise<HttpResponse<OrganizationResponse>> {
    const data = await this.organizationService.findOrganizationById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Organization retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('/')
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createOrganizationReq: CreateOrganizationRequest
  ): Promise<HttpResponse<OrganizationResponse>> {
    const data = await this.organizationService.createOrganization(
      createOrganizationReq,
      req.user.userId
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Organization created successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateOrganizationReq: UpdateOrganizationRequest
  ): Promise<HttpResponse<OrganizationResponse>> {
    const data = await this.organizationService.updateOrganization(
      id,
      updateOrganizationReq
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Organization updated successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async delete(@Param('id') id: string): Promise<HttpResponse<void>> {
    await this.organizationService.deleteOrganization(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Organization deleted successfully',
    };
  }
}
