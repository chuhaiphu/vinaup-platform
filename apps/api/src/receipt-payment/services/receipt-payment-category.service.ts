import { Injectable } from '@nestjs/common';

import { ReceiptPaymentCategoryNotFoundException, ReceiptPaymentCategorySystemReadonlyException } from 'src/_common/exceptions/receipt-payment.exception';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreateReceiptPaymentCategoryRequest } from '../dtos/create-receipt-payment-category.request.dto';
import { ReceiptPaymentCategoryResponse } from '../dtos/receipt-payment-category.response.dto';
import { UpdateReceiptPaymentCategoryRequest } from '../dtos/update-receipt-payment-category.request.dto';

@Injectable()
export class ReceiptPaymentCategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async findCategoriesByCurrentUser(userId: string): Promise<ReceiptPaymentCategoryResponse[]> {
    return this.prismaService.receiptPaymentCategory.findMany({
      where: { userId, organizationId: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findCategoriesByOrganizationId(organizationId: string): Promise<ReceiptPaymentCategoryResponse[]> {
    return this.prismaService.receiptPaymentCategory.findMany({
      where: { organizationId, userId: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findCategoryById(id: string): Promise<ReceiptPaymentCategoryResponse> {
    const category = await this.prismaService.receiptPaymentCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new ReceiptPaymentCategoryNotFoundException();
    }

    return category;
  }

  async createCategory(
    createReq: CreateReceiptPaymentCategoryRequest,
    currentUserId: string,
  ): Promise<ReceiptPaymentCategoryResponse> {
    const { organizationId, ...rest } = createReq;

    return this.prismaService.receiptPaymentCategory.create({
      data: {
        ...rest,
        ...(organizationId ? { organizationId } : { userId: currentUserId }),
      },
    });
  }

  async updateCategory(
    id: string,
    updateReq: UpdateReceiptPaymentCategoryRequest,
  ): Promise<ReceiptPaymentCategoryResponse> {
    const existing = await this.prismaService.receiptPaymentCategory.findUnique({ where: { id } });

    if (!existing) {
      throw new ReceiptPaymentCategoryNotFoundException();
    }

    return this.prismaService.receiptPaymentCategory.update({
      where: { id },
      data: updateReq,
    });
  }

  async deleteCategoryById(id: string): Promise<void> {
    const existing = await this.prismaService.receiptPaymentCategory.findUnique({ where: { id } });

    if (!existing) {
      throw new ReceiptPaymentCategoryNotFoundException();
    }

    if (existing.isSystem) {
      throw new ReceiptPaymentCategorySystemReadonlyException();
    }

    await this.prismaService.receiptPaymentCategory.delete({ where: { id } });
  }
}
