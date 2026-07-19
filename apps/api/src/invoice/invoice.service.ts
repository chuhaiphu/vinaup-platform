import { Injectable } from '@nestjs/common';

import { InvoiceNotFoundException } from 'src/_common/exceptions/invoice.exception';
import { generateDateOverlapClause } from 'src/_common/utils/generator/generate-date-overlap-clause';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreateInvoiceRequest } from './dtos/create-invoice.request.dto';
import { InvoiceFilterParam } from './dtos/invoice-filter.param.dto';
import { InvoiceTypeResponse } from './dtos/invoice-type.response.dto';
import { InvoiceResponse } from './dtos/invoice.response.dto';
import { UpdateInvoiceRequest } from './dtos/update-invoice.request.dto';

@Injectable()
export class InvoiceService {
  constructor(private readonly prismaService: PrismaService) { }

  async findInvoicesByOrganizationId(
    organizationId: string,
    filter?: InvoiceFilterParam,
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
      include: {
        createdBy: true,
        organization: true,
        organizationCustomer: true,
        invoiceType: true
      },
    });

    return invoices;
  }

  async findInvoiceTypes(): Promise<InvoiceTypeResponse[]> {
    const invoiceTypes = await this.prismaService.invoiceType.findMany();
    return invoiceTypes;
  }

  async createInvoice(
    createInvoiceReq: CreateInvoiceRequest,
    currentUserId: string,
  ): Promise<InvoiceResponse> {
    const newInvoice = await this.prismaService.invoice.create({
      data: {
        ...createInvoiceReq,
        createdByUserId: currentUserId,
        status: 'PROCESSING',
      },
      include: {
        createdBy: true,
        organization: true,
        organizationCustomer: true,
        invoiceType: true
      },
    });
    return newInvoice;
  }

  async updateInvoice(
    id: string,
    updateInvoiceReq: UpdateInvoiceRequest,
  ): Promise<InvoiceResponse> {
    const existingInvoice = await this.prismaService.invoice.findUnique({
      where: { id },
    });

    if (!existingInvoice) {
      throw new InvoiceNotFoundException();
    }

    const updatedInvoice = await this.prismaService.invoice.update({
      where: { id },
      data: updateInvoiceReq,
      include: {
        createdBy: true,
        organization: true,
        organizationCustomer: true,
        invoiceType: true
      },
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
      include: {
        createdBy: true,
        organization: true,
        organizationCustomer: true,
        invoiceType: true
      }
    })

    if (!invoice) {
      throw new InvoiceNotFoundException();
    }

    return invoice;
  }
}
