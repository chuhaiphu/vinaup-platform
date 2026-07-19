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
import { OrganizationReceiptPaymentCategoryMutationGuard } from 'src/_core/guards/organization-receipt-payment-category-mutation.guard';

import { CreateReceiptPaymentCategoryRequest } from '../dtos/create-receipt-payment-category.request.dto';
import type { ReceiptPaymentCategoryResponse } from '../dtos/receipt-payment-category.response.dto';
import { UpdateReceiptPaymentCategoryRequest } from '../dtos/update-receipt-payment-category.request.dto';
import { ReceiptPaymentCategoryService } from '../services/receipt-payment-category.service';

@Controller('receipt-payment-category')
export class ReceiptPaymentCategoryController {
  constructor(private readonly receiptPaymentCategoryService: ReceiptPaymentCategoryService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findByCurrentUser(
    @Request() req: AuthenticatedRequest,
  ): Promise<HttpResponse<ReceiptPaymentCategoryResponse[]>> {
    const data = await this.receiptPaymentCategoryService.findCategoriesByCurrentUser(req.user.userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Receipt payment categories retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/organization/:organizationId')
  async findByOrganizationId(
    @Param('organizationId') organizationId: string,
  ): Promise<HttpResponse<ReceiptPaymentCategoryResponse[]>> {
    const data = await this.receiptPaymentCategoryService.findCategoriesByOrganizationId(organizationId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Receipt payment categories retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('/')
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createReq: CreateReceiptPaymentCategoryRequest,
  ): Promise<HttpResponse<ReceiptPaymentCategoryResponse>> {
    const data = await this.receiptPaymentCategoryService.createCategory(createReq, req.user.userId);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Receipt payment category created successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async findById(@Param('id') id: string): Promise<HttpResponse<ReceiptPaymentCategoryResponse>> {
    const data = await this.receiptPaymentCategoryService.findCategoryById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Receipt payment category retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard, OrganizationReceiptPaymentCategoryMutationGuard)
  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateReq: UpdateReceiptPaymentCategoryRequest,
  ): Promise<HttpResponse<ReceiptPaymentCategoryResponse>> {
    const data = await this.receiptPaymentCategoryService.updateCategory(id, updateReq);
    return {
      statusCode: HttpStatus.OK,
      message: 'Receipt payment category updated successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard, OrganizationReceiptPaymentCategoryMutationGuard)
  @Delete('/:id')
  async delete(@Param('id') id: string): Promise<HttpResponse<null>> {
    await this.receiptPaymentCategoryService.deleteCategoryById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Receipt payment category deleted successfully',
      data: null,
    };
  }
}
