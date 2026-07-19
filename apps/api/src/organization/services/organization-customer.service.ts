import { Injectable } from '@nestjs/common';

import { OrganizationCustomerNotFoundException } from 'src/_common/exceptions/organization.exception';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreateOrganizationCustomerRequest } from '../dtos/create-organization-customer.request.dto';
import { OrganizationCustomerResponse } from '../dtos/organization-customer.response.dto';
import { UpdateOrganizationCustomerRequest } from '../dtos/update-organization-customer.request.dto';

@Injectable()
export class OrganizationCustomerService {
  constructor(private readonly prismaService: PrismaService) {}

  async createOrganizationCustomer(
    createOrganizationCustomerReq: CreateOrganizationCustomerRequest,
    currentUserId: string
  ): Promise<OrganizationCustomerResponse> {
    const newOrganizationCustomer =
      await this.prismaService.organizationCustomer.create({
        data: {
          ...createOrganizationCustomerReq,
          createdByUserId: currentUserId,
          joinedAt: new Date(),
        },
        include: {
          createdBy: true,
          clientUser: true,
          clientOrganization: true,
          organization: true,
        },
      });
    return newOrganizationCustomer;
  }

  async getOrganizationCustomersByOrganizationId(
    organizationId: string
  ): Promise<OrganizationCustomerResponse[]> {
    const organizationCustomers =
      await this.prismaService.organizationCustomer.findMany({
        where: { organizationId },
        include: {
          createdBy: true,
          clientUser: true,
          clientOrganization: true,
          organization: true,
        },
      });
    return organizationCustomers;
  }

  async updateOrganizationCustomer(
    id: string,
    updateOrganizationCustomerReq: UpdateOrganizationCustomerRequest
  ): Promise<OrganizationCustomerResponse> {
    const existingOrganizationCustomer =
      await this.prismaService.organizationCustomer.findUnique({
        where: { id },
      });

    if (!existingOrganizationCustomer) {
      throw new OrganizationCustomerNotFoundException();
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
        include: {
          createdBy: true,
          clientUser: true,
          clientOrganization: true,
          organization: true,
        },
      });

    return updatedOrganizationCustomer;
  }
}
