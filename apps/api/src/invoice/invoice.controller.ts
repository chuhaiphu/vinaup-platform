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
import { PERMISSION_ACTION, PERMISSION_RESOURCE } from '@vinaup-platform/permission';

import type {
  AuthenticatedRequest,
  HttpResponse,
} from 'src/_common/interfaces/interface';
import { CheckAbility } from 'src/_core/decorators/check-ability.decorator';
import { JwtAuthGuard } from 'src/_core/guards/jwt-auth.guard';
import { OrganizationPermissionGuard } from 'src/_core/guards/organization-permission.guard';

import { CreateInvoiceRequest } from './dtos/create-invoice.request.dto';
import { InvoiceFilterRequest } from './dtos/invoice-filter.request.dto';
import { InvoiceResponse } from './dtos/invoice.response.dto';
import { UpdateInvoiceRequest } from './dtos/update-invoice.request.dto';
import { InvoiceService } from './invoice.service';

@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
  @CheckAbility(PERMISSION_ACTION.READ, PERMISSION_RESOURCE.INVOICE)
  @Get('/organization/:organizationId')
  async findByOrganizationId(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Query() filter: InvoiceFilterRequest
  ): Promise<HttpResponse<InvoiceResponse[]>> {
    const data = await this.invoiceService.findInvoicesByOrganizationId(
      organizationId,
      req.user.userId,
      filter
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Invoices retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
  @CheckAbility(PERMISSION_ACTION.CREATE, PERMISSION_RESOURCE.INVOICE)
  @Post('/')
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createInvoiceReq: CreateInvoiceRequest
  ): Promise<HttpResponse<InvoiceResponse>> {
    const data = await this.invoiceService.createInvoice(
      createInvoiceReq,
      req.user.userId
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Invoice created successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
  @CheckAbility(PERMISSION_ACTION.READ, PERMISSION_RESOURCE.INVOICE)
  @Get('/:id')
  async findById(@Param('id') id: string): Promise<HttpResponse<InvoiceResponse>> {
    const data = await this.invoiceService.findInvoiceById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Invoice retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
  @CheckAbility(PERMISSION_ACTION.UPDATE, PERMISSION_RESOURCE.INVOICE)
  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateInvoiceReq: UpdateInvoiceRequest
  ): Promise<HttpResponse<InvoiceResponse>> {
    const data = await this.invoiceService.updateInvoice(id, updateInvoiceReq);
    return {
      statusCode: HttpStatus.OK,
      message: 'Invoice updated successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
  @CheckAbility(PERMISSION_ACTION.DELETE, PERMISSION_RESOURCE.INVOICE)
  @Delete('/:id')
  async delete(@Param('id') id: string): Promise<HttpResponse<null>> {
    await this.invoiceService.deleteInvoiceById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Invoice deleted successfully',
      data: null,
    };
  }
}
