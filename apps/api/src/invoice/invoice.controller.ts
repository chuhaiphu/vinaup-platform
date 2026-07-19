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
import { OrganizationInvoiceMutationGuard } from 'src/_core/guards/organization-invoice-mutation.guard';

import { CreateInvoiceRequest } from './dtos/create-invoice.request.dto';
import { InvoiceFilterParam } from './dtos/invoice-filter.param.dto';
import { InvoiceTypeResponse } from './dtos/invoice-type.response.dto';
import { InvoiceResponse } from './dtos/invoice.response.dto';
import { UpdateInvoiceRequest } from './dtos/update-invoice.request.dto';
import { InvoiceService } from './invoice.service';

@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/organization/:organizationId')
  async findByOrganizationId(
    @Param('organizationId') organizationId: string,
    @Query() filter: InvoiceFilterParam
  ): Promise<HttpResponse<InvoiceResponse[]>> {
    const data = await this.invoiceService.findInvoicesByOrganizationId(
      organizationId,
      filter
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Invoices retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/types')
  async findTypes(): Promise<HttpResponse<InvoiceTypeResponse[]>> {
    const data = await this.invoiceService.findInvoiceTypes();
    return {
      statusCode: HttpStatus.OK,
      message: 'Invoice types retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async findById(@Param('id') id: string): Promise<HttpResponse<InvoiceResponse>> {
    const data = await this.invoiceService.findInvoiceById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Invoice retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard, OrganizationInvoiceMutationGuard)
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

  @UseGuards(JwtAuthGuard, OrganizationInvoiceMutationGuard)
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
