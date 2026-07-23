import { Injectable } from '@nestjs/common';
import {
  PERMISSION_ACTION,
  PERMISSION_RESOURCE,
  getUserAbility,
  subject,
} from '@vinaup-platform/permission';
import { INVOICE_TYPE } from '@vinaup-platform/validation';
import type {
  CreateInvoiceRequestInterface,
  InvoiceFilterRequestInterface,
  UpdateInvoiceRequestInterface,
} from '@vinaup-platform/validation';

import { InvoiceNotFoundException } from 'src/_common/exceptions/invoice.exception';
import { generateDateOverlapClause } from 'src/_common/utils/generator/generate-date-overlap-clause';
import { PrismaService } from 'src/prisma/prisma.service';

import { invoiceQueryArgs, type InvoiceResponse } from './dtos/invoice.response.dto';

@Injectable()
export class InvoiceService {
  constructor(private readonly prismaService: PrismaService) { }

  async findInvoicesByOrganizationId(
    organizationId: string,
    userId: string,
    filter?: InvoiceFilterRequestInterface,
  ): Promise<InvoiceResponse[]> {
    // ─── Step 1: Load the caller's granted permissions in THIS organization ─────
    const grantedPermissionList = await this.prismaService.organizationRolePermission.findMany({
      where: {
        organizationRole: {
          organizationId,
          organizationMembers: { some: { userId } },
        },
      },
      select: {
        organizationPermission: { select: { action: true, resource: true, scope: true } },
      },
    });

    // ─── Step 2: Which invoice types may the caller READ? ─────
    const userAbility = getUserAbility(
      grantedPermissionList.map((row) => row.organizationPermission),
    );
    const readableInvoiceTypeList = Object.values(INVOICE_TYPE).filter((invoiceType) =>
      userAbility.can(
        PERMISSION_ACTION.READ,
        subject(PERMISSION_RESOURCE.INVOICE, { type: invoiceType }),
      ),
    );

    // ─── Step 3: Query, restricted to those readable types ─────
    const dateFilterClause = generateDateOverlapClause(filter);
    const whereClause = {
      AND: [
        { type: { in: readableInvoiceTypeList } },
        {
          organizationId: organizationId,
          ...(filter?.status && { status: filter.status }),
          ...(filter?.type && { type: filter.type }),
          ...dateFilterClause,
        },
      ],
    };

    const invoices = await this.prismaService.invoice.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      ...invoiceQueryArgs,
    });

    return invoices;
  }

  async createInvoice(
    createInvoiceReq: CreateInvoiceRequestInterface,
    currentUserId: string,
  ): Promise<InvoiceResponse> {
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
