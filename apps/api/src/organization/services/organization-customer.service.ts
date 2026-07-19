import { Injectable } from '@nestjs/common';
import type {
  CreateOrganizationCustomerRequestInterface,
  UpdateOrganizationCustomerRequestInterface,
} from '@vinaup-platform/validation';

import {
  OrganizationCustomerNotFoundException,
  OrganizationNotFoundException,
} from 'src/_common/exceptions/organization.exception';
import { PrismaService } from 'src/prisma/prisma.service';

import { organizationCustomerQueryArgs, type OrganizationCustomerResponse } from '../dtos/organization-customer.response.dto';

@Injectable()
export class OrganizationCustomerService {
  constructor(private readonly prismaService: PrismaService) {}

  // Replace the old @IsOrganizationExist async validator — a DB-backed existence
  // rule lives in the service, not the schema (Coding Convention §7.3).
  private async assertOrganizationExists(organizationId: string): Promise<void> {
    const organization = await this.prismaService.organization.findUnique({
      where: { id: organizationId },
      select: { id: true },
    });
    if (!organization) throw new OrganizationNotFoundException();
  }

  async createOrganizationCustomer(
    createOrganizationCustomerReq: CreateOrganizationCustomerRequestInterface,
    currentUserId: string
  ): Promise<OrganizationCustomerResponse> {
    await this.assertOrganizationExists(createOrganizationCustomerReq.organizationId);
    if (createOrganizationCustomerReq.clientOrganizationId) {
      await this.assertOrganizationExists(createOrganizationCustomerReq.clientOrganizationId);
    }

    const newOrganizationCustomer =
      await this.prismaService.organizationCustomer.create({
        data: {
          ...createOrganizationCustomerReq,
          createdByUserId: currentUserId,
          joinedAt: new Date(),
        },
        ...organizationCustomerQueryArgs,
      });
    return newOrganizationCustomer;
  }

  async getOrganizationCustomersByOrganizationId(
    organizationId: string
  ): Promise<OrganizationCustomerResponse[]> {
    const organizationCustomers =
      await this.prismaService.organizationCustomer.findMany({
        where: { organizationId },
        ...organizationCustomerQueryArgs,
      });
    return organizationCustomers;
  }

  async updateOrganizationCustomer(
    id: string,
    updateOrganizationCustomerReq: UpdateOrganizationCustomerRequestInterface
  ): Promise<OrganizationCustomerResponse> {
    const existingOrganizationCustomer =
      await this.prismaService.organizationCustomer.findUnique({
        where: { id },
      });

    if (!existingOrganizationCustomer) {
      throw new OrganizationCustomerNotFoundException();
    }

    if (updateOrganizationCustomerReq.organizationId) {
      await this.assertOrganizationExists(updateOrganizationCustomerReq.organizationId);
    }
    if (updateOrganizationCustomerReq.clientOrganizationId) {
      await this.assertOrganizationExists(updateOrganizationCustomerReq.clientOrganizationId);
    }

    const updatedOrganizationCustomer =
      await this.prismaService.organizationCustomer.update({
        where: { id },
        data: {
          // Pass fields straight through: undefined → leave unchanged, null → clear
          // (nullable columns), ISO string → Prisma parses the DateTime itself.
          name: updateOrganizationCustomerReq.name,
          phone: updateOrganizationCustomerReq.phone,
          email: updateOrganizationCustomerReq.email,
          status: updateOrganizationCustomerReq.status,
          joinedAt: updateOrganizationCustomerReq.joinedAt,
          clientUserId: updateOrganizationCustomerReq.clientUserId,
          clientOrganizationId: updateOrganizationCustomerReq.clientOrganizationId,
        },
        ...organizationCustomerQueryArgs,
      });

    return updatedOrganizationCustomer;
  }
}
