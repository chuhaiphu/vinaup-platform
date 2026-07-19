import { Injectable } from '@nestjs/common';
import type {
  CreateInvoiceRequestInterface,
  InvoiceFilterRequestInterface,
  UpdateInvoiceRequestInterface,
} from '@vinaup-platform/validation';

import { InvoiceNotFoundException, InvoiceTypeNotFoundException } from 'src/_common/exceptions/invoice.exception';
import { generateDateOverlapClause } from 'src/_common/utils/generator/generate-date-overlap-clause';
import { PrismaService } from 'src/prisma/prisma.service';

import type { InvoiceTypeResponse } from './dtos/invoice-type.response.dto';
import { invoiceQueryArgs, type InvoiceResponse } from './dtos/invoice.response.dto';

@Injectable()
export class InvoiceService {
  constructor(private readonly prismaService: PrismaService) { }

  async findInvoicesByOrganizationId(
    organizationId: string,
    filter?: InvoiceFilterRequestInterface,
  ): Promise<InvoiceResponse[]> {
    const dateFilterClause = generateDateOverlapClause(filter);

    const whereClause = {
      organizationId: organizationId,
      ...(filter?.status && { status: filter.status }),
      ...(filter?.invoiceTypeId && { invoiceTypeId: filter.invoiceTypeId }),
      ...dateFilterClause,
    };

    const invoices = await this.prismaService.invoice.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      ...invoiceQueryArgs,
    });

    return invoices;
  }

  private async assertInvoiceTypeExists(invoiceTypeId: string): Promise<void> {
    const invoiceType = await this.prismaService.invoiceType.findUnique({
      where: { id: invoiceTypeId },
      select: { id: true },
    });
    if (!invoiceType) throw new InvoiceTypeNotFoundException();
  }

  async findInvoiceTypes(): Promise<InvoiceTypeResponse[]> {
    const invoiceTypes = await this.prismaService.invoiceType.findMany();
    return invoiceTypes;
  }

  async createInvoice(
    createInvoiceReq: CreateInvoiceRequestInterface,
    currentUserId: string,
  ): Promise<InvoiceResponse> {
    await this.assertInvoiceTypeExists(createInvoiceReq.invoiceTypeId);

    const newInvoice = await this.prismaService.invoice.create({
      data: {
        ...createInvoiceReq,
        createdByUserId: currentUserId,
        status: 'PROCESSING',
      },
      ...invoiceQueryArgs,
    });
    return newInvoice;
  }

  async updateInvoice(
    id: string,
    updateInvoiceReq: UpdateInvoiceRequestInterface,
  ): Promise<InvoiceResponse> {
    const existingInvoice = await this.prismaService.invoice.findUnique({
      where: { id },
    });

    if (!existingInvoice) {
      throw new InvoiceNotFoundException();
    }

    if (updateInvoiceReq.invoiceTypeId) {
      await this.assertInvoiceTypeExists(updateInvoiceReq.invoiceTypeId);
    }

    const updatedInvoice = await this.prismaService.invoice.update({
      where: { id },
      data: updateInvoiceReq,
      ...invoiceQueryArgs,
    });
    return updatedInvoice;
  }

  async deleteInvoiceById(id: string): Promise<void> {
    const existingInvoice = await this.prismaService.invoice.findUnique({
      where: { id },
    });

    if (!existingInvoice) {
      throw new InvoiceNotFoundException();
    }

    await this.prismaService.invoice.delete({
      where: { id },
    });
  };

  async findInvoiceById(id: string): Promise<InvoiceResponse> {
    const invoice = await this.prismaService.invoice.findUnique({
      where: { id },
      ...invoiceQueryArgs,
    })

    if (!invoice) {
      throw new InvoiceNotFoundException();
    }

    return invoice;
  }
}
