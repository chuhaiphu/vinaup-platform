import { Injectable } from '@nestjs/common';

import { ReceiptPaymentNotFoundException, ReceiptPaymentNotTourParticipantException } from 'src/_common/exceptions/receipt-payment.exception';
import { TourImplementationNotFoundException } from 'src/_common/exceptions/tour.exception';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreateReceiptPaymentRequest } from '../dtos/create-receipt-payment.request.dto';
import { ReceiptPaymentFilterParam } from '../dtos/receipt-payment-filter.param.dto';
import { ReceiptPaymentResponse } from '../dtos/receipt-payment.response.dto';
import { UpdateReceiptPaymentRequest } from '../dtos/update-receipt-payment.request.dto';

@Injectable()
export class ReceiptPaymentService {
  constructor(private readonly prismaService: PrismaService) { }

  async createReceiptPayment(
    createReceiptPaymentReq: CreateReceiptPaymentRequest,
    currentUserId: string
  ): Promise<ReceiptPaymentResponse> {
    const { tourImplementationId, groupCode, ...restCreateReceiptPaymentReq } =
      createReceiptPaymentReq;
    const newReceiptPayment = await this.prismaService.receiptPayment.create({
      data: {
        ...restCreateReceiptPaymentReq,
        createdByUserId: currentUserId,
      },
      include: {
        createdBy: true,
        project: true,
        organization: true,
        invoice: true,
        booking: true,
        tourCalculation: true,
        tourImplementationReceiptPayments: true,
        tourSettlement: true,
        wage: true,
        category: true,
        carMaintenanceLog: true,
        trip: true,
      },
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
        include: {
          createdBy: true,
          project: true,
          organization: true,
          invoice: true,
          booking: true,
          tourCalculation: true,
          tourImplementationReceiptPayments: true,
          tourSettlement: true,
          wage: true,
          category: true,
          carMaintenanceLog: true,
          trip: true,
        },
      });
    }

    return newReceiptPayment;
  }

  async updateReceiptPayment(
    id: string,
    updateReceiptPaymentReq: UpdateReceiptPaymentRequest
  ): Promise<ReceiptPaymentResponse> {
    const existingReceiptPayment =
      await this.prismaService.receiptPayment.findUnique({
        where: { id },
      });

    if (!existingReceiptPayment) {
      throw new ReceiptPaymentNotFoundException();
    }

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
      include: {
        createdBy: true,
        project: true,
        organization: true,
        invoice: true,
        booking: true,
        tourCalculation: true,
        tourImplementationReceiptPayments: true,
        tourSettlement: true,
        wage: true,
        category: true,
        carMaintenanceLog: true,
        trip: true,
      },
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
    filter?: ReceiptPaymentFilterParam
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
      include: {
        createdBy: true,
        project: true,
        organization: true,
        invoice: true,
        booking: true,
        tourCalculation: true,
        tourImplementationReceiptPayments: true,
        tourSettlement: true,
        wage: true,
        category: true,
        carMaintenanceLog: true,
        trip: true,
      },
      orderBy: {
        transactionDate: 'desc',
      },
    });

    return receiptPayments;
  }

  async findReceiptPaymentById(id: string): Promise<ReceiptPaymentResponse> {
    const receiptPayment = await this.prismaService.receiptPayment.findUnique({
      where: { id },
      include: {
        createdBy: true,
        project: true,
        organization: true,
        invoice: true,
        tourCalculation: true,
        tourImplementationReceiptPayments: true,
        tourSettlement: true,
        booking: true,
        wage: true,
        category: true,
        carMaintenanceLog: true,
        trip: true,
      },
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
      include: {
        createdBy: true,
        project: true,
        organization: true,
        invoice: true,
        tourCalculation: true,
        tourImplementationReceiptPayments: true,
        tourSettlement: true,
        booking: true,
        wage: true,
        category: true,
        carMaintenanceLog: true,
        trip: true,
      },
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
      include: {
        createdBy: true,
        project: true,
        organization: true,
        invoice: true,
        tourCalculation: true,
        tourImplementationReceiptPayments: true,
        tourSettlement: true,
        booking: true,
        wage: true,
        category: true,
        carMaintenanceLog: true,
        trip: true,
      },
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
      include: {
        createdBy: true,
        project: true,
        organization: true,
        invoice: true,
        tourCalculation: true,
        tourImplementationReceiptPayments: true,
        tourSettlement: true,
        booking: true,
        wage: true,
        category: true,
        carMaintenanceLog: true,
        trip: true,
      },
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
      include: {
        createdBy: true,
        project: true,
        organization: true,
        invoice: true,
        tourCalculation: true,
        tourImplementationReceiptPayments: true,
        tourSettlement: true,
        booking: true,
        wage: true,
        category: true,
        carMaintenanceLog: true,
        trip: true,
      },
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
      include: {
        createdBy: true,
        project: true,
        organization: true,
        invoice: true,
        tourCalculation: true,
        tourImplementationReceiptPayments: true,
        tourSettlement: true,
        booking: true,
        wage: true,
        category: true,
        carMaintenanceLog: true,
        trip: true,
      },
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
      include: {
        createdBy: true,
        project: true,
        organization: true,
        invoice: true,
        tourCalculation: true,
        tourImplementationReceiptPayments: true,
        tourSettlement: true,
        booking: true,
        wage: true,
        category: true,
        carMaintenanceLog: true,
        trip: true,
      },
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
      include: {
        createdBy: true,
        project: true,
        organization: true,
        invoice: true,
        tourCalculation: true,
        tourImplementationReceiptPayments: true,
        tourSettlement: true,
        booking: true,
        wage: true,
        category: true,
        carMaintenanceLog: true,
        trip: true,
      },
    });

    return receiptPayments;
  }

  async findReceiptPaymentsByOrganizationId(
    organizationId: string,
    filter?: ReceiptPaymentFilterParam
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
      include: {
        createdBy: true,
        project: true,
        organization: true,
        invoice: { include: { invoiceType: true } },
        tourCalculation: true,
        tourImplementationReceiptPayments: true,
        tourSettlement: true,
        booking: true,
        wage: true,
        category: true,
        carMaintenanceLog: true,
        trip: true,
      },
    });

    return receiptPayments;
  }

  async findReceiptPaymentsByWageId(
    wageId: string
  ): Promise<ReceiptPaymentResponse[]> {
    return this.prismaService.receiptPayment.findMany({
      where: { wageId },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: true,
        project: true,
        organization: true,
        invoice: true,
        tourCalculation: true,
        tourImplementationReceiptPayments: true,
        tourSettlement: true,
        booking: true,
        wage: true,
        category: true,
        carMaintenanceLog: true,
        trip: true,
      },
    });
  }

  async findReceiptPaymentsByWageIds(
    wageIds: string[]
  ): Promise<ReceiptPaymentResponse[]> {
    return this.prismaService.receiptPayment.findMany({
      where: { wageId: { in: wageIds } },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: true,
        project: true,
        organization: true,
        invoice: true,
        tourCalculation: true,
        tourImplementationReceiptPayments: true,
        tourSettlement: true,
        booking: true,
        wage: true,
        category: true,
        carMaintenanceLog: true,
        trip: true,
      },
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
      include: {
        createdBy: true,
        project: true,
        organization: true,
        invoice: true,
        tourCalculation: true,
        tourImplementationReceiptPayments: true,
        tourSettlement: true,
        booking: true,
        wage: true,
        category: true,
        carMaintenanceLog: true,
        trip: true,
      },
    });

    return receiptPayments;
  }

  async findReceiptPaymentsByCarMaintenanceLogId(
    carMaintenanceLogId: string
  ): Promise<ReceiptPaymentResponse[]> {
    return this.prismaService.receiptPayment.findMany({
      where: { carMaintenanceLogId },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: true,
        project: true,
        organization: true,
        invoice: true,
        tourCalculation: true,
        tourImplementationReceiptPayments: true,
        tourSettlement: true,
        booking: true,
        wage: true,
        category: true,
        carMaintenanceLog: true,
        trip: true,
      },
    });
  }

  async findReceiptPaymentsByTripId(
    tripId: string
  ): Promise<ReceiptPaymentResponse[]> {
    return this.prismaService.receiptPayment.findMany({
      where: { tripId },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: true,
        project: true,
        organization: true,
        invoice: true,
        tourCalculation: true,
        tourImplementationReceiptPayments: true,
        tourSettlement: true,
        booking: true,
        wage: true,
        category: true,
        carMaintenanceLog: true,
        trip: true,
      },
    });
  }
}
