import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PERMISSION_ACTION, PERMISSION_RESOURCE } from '@vinaup-platform/permission';

import type {
  AuthenticatedRequest,
  HttpResponse,
} from 'src/_common/interfaces/interface';
import { CheckAbility } from 'src/_core/decorators/check-ability.decorator';
import { JwtAuthGuard } from 'src/_core/guards/jwt-auth.guard';
import { OrganizationPermissionGuard } from 'src/_core/guards/organization-permission.guard';

import { CreateOrganizationCustomerRequest } from '../dtos/create-organization-customer.request.dto';
import type { OrganizationCustomerResponse } from '../dtos/organization-customer.response.dto';
import { UpdateOrganizationCustomerRequest } from '../dtos/update-organization-customer.request.dto';
import { OrganizationCustomerService } from '../services/organization-customer.service';

@Controller('organization-customer')
export class OrganizationCustomerController {
  constructor(
    private readonly organizationCustomerService: OrganizationCustomerService
  ) {}

  @UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
  @CheckAbility(PERMISSION_ACTION.CREATE, PERMISSION_RESOURCE.ORGANIZATION_CUSTOMER)
  @Post('/')
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createOrganizationCustomerReq: CreateOrganizationCustomerRequest
  ): Promise<HttpResponse<OrganizationCustomerResponse>> {
    const data = await this.organizationCustomerService.createOrganizationCustomer(
      createOrganizationCustomerReq,
      req.user.userId
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Organization customer created successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
  @CheckAbility(PERMISSION_ACTION.READ, PERMISSION_RESOURCE.ORGANIZATION_CUSTOMER)
  @Get('/by-organization/:organizationId')
  async findByOrganizationId(
    @Param('organizationId') organizationId: string
  ): Promise<HttpResponse<OrganizationCustomerResponse[]>> {
    const data =
      await this.organizationCustomerService.getOrganizationCustomersByOrganizationId(
        organizationId
      );
    return {
      statusCode: HttpStatus.OK,
      message: 'Organization customers retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateOrganizationCustomerReq: UpdateOrganizationCustomerRequest
  ): Promise<HttpResponse<OrganizationCustomerResponse>> {
    const data = await this.organizationCustomerService.updateOrganizationCustomer(
      id,
      updateOrganizationCustomerReq
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Organization customer updated successfully',
      data,
    };
  }
}
