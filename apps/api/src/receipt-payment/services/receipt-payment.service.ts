import { Injectable } from '@nestjs/common';
import type {
  CreateReceiptPaymentRequestInterface,
  ReceiptPaymentFilterRequestInterface,
  UpdateReceiptPaymentRequestInterface,
} from '@vinaup-platform/validation';

import { BookingNotFoundException } from 'src/_common/exceptions/booking.exception';
import { CarMaintenanceLogNotFoundException } from 'src/_common/exceptions/car.exception';
import { InvoiceNotFoundException } from 'src/_common/exceptions/invoice.exception';
import { OrganizationNotFoundException } from 'src/_common/exceptions/organization.exception';
import { ProjectNotFoundException } from 'src/_common/exceptions/project.exception';
import { ReceiptPaymentNotFoundException, ReceiptPaymentNotTourParticipantException } from 'src/_common/exceptions/receipt-payment.exception';
import {
  TourCalculationNotFoundException,
  TourImplementationNotFoundException,
  TourSettlementNotFoundException,
} from 'src/_common/exceptions/tour.exception';
import { TripNotFoundException } from 'src/_common/exceptions/trip.exception';
import { WageNotFoundException } from 'src/_common/exceptions/wage.exception';
import { PrismaService } from 'src/prisma/prisma.service';

import { receiptPaymentQueryArgs, type ReceiptPaymentResponse } from '../dtos/receipt-payment.response.dto';

@Injectable()
export class ReceiptPaymentService {
  constructor(private readonly prismaService: PrismaService) { }
  private async assertReceiptPaymentRelationsExist(input: {
    projectId?: string | null;
    invoiceId?: string | null;
    organizationId?: string | null;
    tourCalculationId?: string | null;
    tourImplementationId?: string | null;
    tourSettlementId?: string | null;
    bookingId?: string | null;
    wageId?: string | null;
    carMaintenanceLogId?: string | null;
    tripId?: string | null;
  }): Promise<void> {
    const relationChecks: [string | null | undefined, () => Promise<{ id: string } | null>, () => Error][] = [
      [input.projectId, () => this.prismaService.project.findUnique({ where: { id: input.projectId! }, select: { id: true } }), () => new ProjectNotFoundException()],
      [input.invoiceId, () => this.prismaService.invoice.findUnique({ where: { id: input.invoiceId! }, select: { id: true } }), () => new InvoiceNotFoundException()],
      [input.organizationId, () => this.prismaService.organization.findUnique({ where: { id: input.organizationId! }, select: { id: true } }), () => new OrganizationNotFoundException()],
      [input.tourCalculationId, () => this.prismaService.tourCalculation.findUnique({ where: { id: input.tourCalculationId! }, select: { id: true } }), () => new TourCalculationNotFoundException()],
      [input.tourImplementationId, () => this.prismaService.tourImplementation.findUnique({ where: { id: input.tourImplementationId! }, select: { id: true } }), () => new TourImplementationNotFoundException()],
      [input.tourSettlementId, () => this.prismaService.tourSettlement.findUnique({ where: { id: input.tourSettlementId! }, select: { id: true } }), () => new TourSettlementNotFoundException()],
      [input.bookingId, () => this.prismaService.booking.findUnique({ where: { id: input.bookingId! }, select: { id: true } }), () => new BookingNotFoundException()],
      [input.wageId, () => this.prismaService.wage.findUnique({ where: { id: input.wageId! }, select: { id: true } }), () => new WageNotFoundException()],
      [input.carMaintenanceLogId, () => this.prismaService.carMaintenanceLog.findUnique({ where: { id: input.carMaintenanceLogId! }, select: { id: true } }), () => new CarMaintenanceLogNotFoundException()],
      [input.tripId, () => this.prismaService.trip.findUnique({ where: { id: input.tripId! }, select: { id: true } }), () => new TripNotFoundException()],
    ];
    for (const [id, find, buildError] of relationChecks) {
      if (!id) continue;
      const found = await find();
      if (!found) throw buildError();
    }
  }

  async createReceiptPayment(
    createReceiptPaymentReq: CreateReceiptPaymentRequestInterface,
    currentUserId: string
  ): Promise<ReceiptPaymentResponse> {
    await this.assertReceiptPaymentRelationsExist(createReceiptPaymentReq);

    const { tourImplementationId, groupCode, ...restCreateReceiptPaymentReq } =
      createReceiptPaymentReq;
    const newReceiptPayment = await this.prismaService.receiptPayment.create({
      data: {
        ...restCreateReceiptPaymentReq,
        createdByUserId: currentUserId,
      },
      ...receiptPaymentQueryArgs,
    });
    if (tourImplementationId && groupCode) {
      const tourImplementation =
        await this.prismaService.tourImplementation.findUnique({
          where: { id: tourImplementationId },
        });
      if (!tourImplementation) {
        throw new TourImplementationNotFoundException();
      }
      await this.prismaService.tourImplementationReceiptPayment.create({
        data: {
          tourImplementationId: tourImplementationId,
          receiptPaymentId: newReceiptPayment.id,
          groupCode: groupCode,
        },
      });

      // Because The create above runs after the initial include query,
      // newReceiptPayment has an empty tourImplementationReceiptPayments array.
      // we query receiptPayment again to ensure tourImplementationReceiptPayments is populated in the response.
      return this.prismaService.receiptPayment.findUniqueOrThrow({
        where: { id: newReceiptPayment.id },
        ...receiptPaymentQueryArgs,
      });
    }

    return newReceiptPayment;
  }

  async updateReceiptPayment(
    id: string,
    updateReceiptPaymentReq: UpdateReceiptPaymentRequestInterface
  ): Promise<ReceiptPaymentResponse> {
    const existingReceiptPayment =
      await this.prismaService.receiptPayment.findUnique({
        where: { id },
      });

    if (!existingReceiptPayment) {
      throw new ReceiptPaymentNotFoundException();
    }

    await this.assertReceiptPaymentRelationsExist(updateReceiptPaymentReq);

    // tourImplementationId and groupCode belong to junction table tourImplementationReceiptPayment
    const { tourImplementationId, groupCode, ...restUpdateReceiptPaymentReq } =
      updateReceiptPaymentReq;
    if (tourImplementationId && groupCode) {
      const tourImplementation =
        await this.prismaService.tourImplementation.findUnique({
          where: { id: tourImplementationId },
        });
      if (!tourImplementation) {
        throw new TourImplementationNotFoundException();
      }
      // Persist the group code on the junction tourImplementationReceiptPayment table.
      await this.prismaService.tourImplementationReceiptPayment.upsert({
        where: {
          tourImplementationId_receiptPaymentId: {
            tourImplementationId,
            receiptPaymentId: id,
          },
        },
        update: { groupCode },
        create: { tourImplementationId, receiptPaymentId: id, groupCode },
      });
    }
    const updatedReceiptPayment = await this.prismaService.receiptPayment.update({
      where: { id },
      data: restUpdateReceiptPaymentReq,
      ...receiptPaymentQueryArgs,
    });
    return updatedReceiptPayment;
  }

  async deleteReceiptPaymentById(id: string): Promise<void> {
    const existingReceiptPayment =
      await this.prismaService.receiptPayment.findUnique({
        where: { id },
      });

    if (!existingReceiptPayment) {
      throw new ReceiptPaymentNotFoundException();
    }

    await this.prismaService.receiptPayment.delete({
      where: { id },
    });
  }

  async findReceiptPaymentsByCurrentUser(
    currentUserId: string,
    filter?: ReceiptPaymentFilterRequestInterface
  ): Promise<ReceiptPaymentResponse[]> {
    const dateFilterClause = (() => {
      if (!filter?.startDate || !filter?.endDate) return {};
      return {
        transactionDate: { gte: new Date(filter.startDate), lte: new Date(filter.endDate) },
      };
    })();

    const whereClause = {
      createdByUserId: currentUserId,
      ...(filter?.type && { type: filter.type }),
      ...(filter?.transactionType && { transactionType: filter.transactionType }),
      ...dateFilterClause,
    };

    const receiptPayments = await this.prismaService.receiptPayment.findMany({
      where: whereClause,
      ...receiptPaymentQueryArgs,
      orderBy: {
        transactionDate: 'desc',
      },
    });

    return receiptPayments;
  }

  async findReceiptPaymentById(id: string): Promise<ReceiptPaymentResponse> {
    const receiptPayment = await this.prismaService.receiptPayment.findUnique({
      where: { id },
      ...receiptPaymentQueryArgs,
    });

    if (!receiptPayment) {
      throw new ReceiptPaymentNotFoundException();
    }

    return receiptPayment;
  }

  async findReceiptPaymentsByProjectId(
    projectId: string
  ): Promise<ReceiptPaymentResponse[]> {
    const receiptPayments = await this.prismaService.receiptPayment.findMany({
      where: { projectId },
      orderBy: {
        createdAt: 'desc',
      },
      ...receiptPaymentQueryArgs,
    });

    return receiptPayments;
  }

  async findReceiptPaymentsByProjectIds(
    projectIds: string[]
  ): Promise<ReceiptPaymentResponse[]> {
    const receiptPayments = await this.prismaService.receiptPayment.findMany({
      where: { projectId: { in: projectIds } },
      orderBy: {
        createdAt: 'desc',
      },
      ...receiptPaymentQueryArgs,
    });

    return receiptPayments;
  }

  async findReceiptPaymentsByInvoiceIds(
    invoiceIds: string[]
  ): Promise<ReceiptPaymentResponse[]> {
    const receiptPayments = await this.prismaService.receiptPayment.findMany({
      where: { invoiceId: { in: invoiceIds } },
      orderBy: {
        createdAt: 'desc',
      },
      ...receiptPaymentQueryArgs,
    });

    return receiptPayments;
  }

  async findReceiptPaymentsByInvoiceId(
    invoiceId: string
  ): Promise<ReceiptPaymentResponse[]> {
    const receiptPayments = await this.prismaService.receiptPayment.findMany({
      where: { invoiceId },
      orderBy: {
        createdAt: 'desc',
      },
      ...receiptPaymentQueryArgs,
    });

    return receiptPayments;
  }

  async findReceiptPaymentsByTourCalculationId(
    tourCalculationId: string
  ): Promise<ReceiptPaymentResponse[]> {
    const receiptPayments = await this.prismaService.receiptPayment.findMany({
      where: { tourCalculationId },
      orderBy: {
        createdAt: 'desc',
      },
      ...receiptPaymentQueryArgs,
    });

    return receiptPayments;
  }

  async findReceiptPaymentsByTourImplementationId(
    tourImplementationId: string,
    currentUserId: string
  ): Promise<ReceiptPaymentResponse[]> {
    const memberAssigned =
      await this.prismaService.memberAssignedTourImplementation.findFirst({
        where: {
          tourImplementationId,
          organizationMember: { userId: currentUserId },
        },
      });

    const assignedUser =
      await this.prismaService.userAssignedTourImplementation.findFirst({
        where: {
          tourImplementationAssignment: { tourImplementationId },
          userId: currentUserId,
        },
      });

    if (!memberAssigned && !assignedUser) {
      throw new ReceiptPaymentNotTourParticipantException();
    }

    // Receipt payments will be queried base on group codes
    // There are 2 group codes: FOR_DIRECTOR and FOR_TOUR_GUIDE
    let allowedGroupCodes: string[];

    // memberAssigned always gets all groups
    // assignedUser only gets FOR_TOUR_GUIDE if they have the explicit permission
    if (memberAssigned) {
      allowedGroupCodes = ['FOR_DIRECTOR', 'FOR_TOUR_GUIDE'];
    } else {
      // assignedUser only
      if (assignedUser!.permissions.includes('RECEIPT_PAYMENT_FOR_TOUR_GUIDE_READ'))
        allowedGroupCodes = ['FOR_TOUR_GUIDE']
      else allowedGroupCodes = []
    }

    if (allowedGroupCodes.length === 0) {
      return [];
    }

    const receiptPayments = await this.prismaService.receiptPayment.findMany({
      where: {
        tourImplementationReceiptPayments: {
          some: {
            tourImplementationId,
            groupCode: { in: allowedGroupCodes },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      ...receiptPaymentQueryArgs,
    });

    return receiptPayments;
  }

  async findReceiptPaymentsByTourSettlementId(
    tourSettlementId: string
  ): Promise<ReceiptPaymentResponse[]> {
    const receiptPayments = await this.prismaService.receiptPayment.findMany({
      where: { tourSettlementId },
      orderBy: {
        createdAt: 'desc',
      },
      ...receiptPaymentQueryArgs,
    });

    return receiptPayments;
  }

  async findReceiptPaymentsByOrganizationId(
    organizationId: string,
    filter?: ReceiptPaymentFilterRequestInterface
  ): Promise<ReceiptPaymentResponse[]> {
    const dateFilterClause = (() => {
      if (!filter?.startDate || !filter?.endDate) return {};
      return {
        transactionDate: { gte: new Date(filter.startDate), lte: new Date(filter.endDate) },
      };
    })();

    const whereClause = {
      projectId: null,
      organizationId: organizationId,
      ...(filter?.type && { type: filter.type }),
      ...(filter?.transactionType && { transactionType: filter.transactionType }),
      ...dateFilterClause,
    };

    const receiptPayments = await this.prismaService.receiptPayment.findMany({
      where: whereClause,
      ...receiptPaymentQueryArgs,
    });

    return receiptPayments;
  }

  async findReceiptPaymentsByWageId(
    wageId: string
  ): Promise<ReceiptPaymentResponse[]> {
    return this.prismaService.receiptPayment.findMany({
      where: { wageId },
      orderBy: { createdAt: 'desc' },
      ...receiptPaymentQueryArgs,
    });
  }

  async findReceiptPaymentsByWageIds(
    wageIds: string[]
  ): Promise<ReceiptPaymentResponse[]> {
    return this.prismaService.receiptPayment.findMany({
      where: { wageId: { in: wageIds } },
      orderBy: { createdAt: 'desc' },
      ...receiptPaymentQueryArgs,
    });
  }

  async findReceiptPaymentsByBookingId(
    bookingId: string
  ): Promise<ReceiptPaymentResponse[]> {
    const receiptPayments = await this.prismaService.receiptPayment.findMany({
      where: { bookingId },
      orderBy: {
        createdAt: 'desc',
      },
      ...receiptPaymentQueryArgs,
    });

    return receiptPayments;
  }

  async findReceiptPaymentsByCarMaintenanceLogId(
    carMaintenanceLogId: string
  ): Promise<ReceiptPaymentResponse[]> {
    return this.prismaService.receiptPayment.findMany({
      where: { carMaintenanceLogId },
      orderBy: { createdAt: 'desc' },
      ...receiptPaymentQueryArgs,
    });
  }

  async findReceiptPaymentsByTripId(
    tripId: string
  ): Promise<ReceiptPaymentResponse[]> {
    return this.prismaService.receiptPayment.findMany({
      where: { tripId },
      orderBy: { createdAt: 'desc' },
      ...receiptPaymentQueryArgs,
    });
  }
}
