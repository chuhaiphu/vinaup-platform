import { Injectable } from '@nestjs/common';
import {
  RECEIPT_PAYMENT_GROUP_CODE,
  TOUR_IMPLEMENTATION_MEMBER_ROLE,
} from '@vinaup-platform/permission';
import {
  TOUR_STATUS,
  type TourFilterRequestInterface,
  type CreateTourRequestInterface,
  type UpdateTourRequestInterface,
} from '@vinaup-platform/validation';
import { DOCUMENT_TYPE } from '@vinaup-platform/validation';

import { SIGNATURE_ROLE } from 'src/_common/constants/signature.constant';
import { OrganizationNotFoundException } from 'src/_common/exceptions/organization.exception';
import { TourCalculationNotFoundException, TourImplementationNotFoundException, TourNotFoundException } from 'src/_common/exceptions/tour.exception';
import { generateDateOverlapClause } from 'src/_common/utils/generator/generate-date-overlap-clause';
import { PrismaService } from 'src/prisma/prisma.service';

import { TourResponse } from '../dtos/tour.response.dto';

@Injectable()
export class TourService {
  constructor(private readonly prismaService: PrismaService) {}

  async findToursByOrganizationId(
    organizationId: string,
    filter?: TourFilterRequestInterface
  ): Promise<TourResponse[]> {
    const dateFilterClause = generateDateOverlapClause(filter);

    const whereClause = {
      organizationId,
      ...(filter?.status && { status: filter.status }),
      ...dateFilterClause,
    };

    const tours = await this.prismaService.tour.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: true,
        organization: true,
        organizationCustomer: true,
        tourCalculation: true,
        tourImplementation: true,
        tourSettlement: true,
      },
    });

    return tours;
  }

  async createTour(
    createTourReq: CreateTourRequestInterface,
    currentUserId: string
  ): Promise<TourResponse> {
    const exisitingTourOrganization =
      await this.prismaService.organization.findUnique({
        where: { id: createTourReq.organizationId },
        include: {
          createdBy: true,
        },
      });
    if (!exisitingTourOrganization) {
      throw new OrganizationNotFoundException();
    }

    const membersAssignedData = [];

    const creatorMember = await this.prismaService.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: currentUserId,
          organizationId: createTourReq.organizationId,
        },
      },
    });

    if (creatorMember) {
      membersAssignedData.push({
        organizationMemberId: creatorMember.id,
        role: TOUR_IMPLEMENTATION_MEMBER_ROLE.CREATOR,
      });
    }

    const newTour = await this.prismaService.tour.create({
      data: {
        ...createTourReq,
        createdByUserId: currentUserId,
        status: TOUR_STATUS.PENDING,
        tourCalculation: {
          create: {
            createdByUserId: currentUserId,
          },
        },
        tourImplementation: {
          create: {
            createdByUserId: currentUserId,
            membersAssigned: {
              createMany: {
                data: membersAssignedData,
              },
            },
            description: '',
          },
        },
        tourSettlement: {
          create: {
            createdByUserId: currentUserId,
          },
        },
      },
      include: {
        createdBy: true,
        organization: true,
        organizationCustomer: true,
        tourCalculation: true,
        tourImplementation: {
          include: {
            membersAssigned: true,
          },
        },
        tourSettlement: true,
      },
    });

    await this.prismaService.signature.createMany({
      data: [
        {
          signatureRole: SIGNATURE_ROLE.SENDER,
          documentId: newTour.tourCalculation!.id,
          documentType: DOCUMENT_TYPE.TOUR_CALCULATION,
          targetUserId: currentUserId,
        },
        {
          signatureRole: SIGNATURE_ROLE.SENDER,
          documentId: newTour.tourSettlement!.id,
          documentType: DOCUMENT_TYPE.TOUR_SETTLEMENT,
          targetUserId: currentUserId,
        },
      ],
    });

    return newTour;
  }

  async findTourById(id: string): Promise<TourResponse> {
    const tour = await this.prismaService.tour.findUnique({
      where: { id },
      include: {
        createdBy: true,
        organization: true,
        organizationCustomer: true,
        tourCalculation: true,
        tourImplementation: {
          include: {
            membersAssigned: {
              include: {
                organizationMember: true,
              },
            },
            tourImplementationAssignments: {
              include: {
                usersAssigned: true,
              },
              orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
            },
          },
        },
        tourSettlement: true,
      },
    });

    if (!tour) {
      throw new TourNotFoundException();
    }

    return tour;
  }

  async updateTour(
    id: string,
    updateTourReq: UpdateTourRequestInterface
  ): Promise<TourResponse> {
    const existingTour = await this.prismaService.tour.findUnique({
      where: { id },
    });

    if (!existingTour) {
      throw new TourNotFoundException();
    }

    const updatedTour = await this.prismaService.tour.update({
      where: { id },
      data: updateTourReq,
      include: {
        createdBy: true,
        organization: true,
        organizationCustomer: true,
        tourCalculation: true,
        tourImplementation: true,
        tourSettlement: true,
      },
    });

    return updatedTour;
  }

  async deleteTourById(id: string): Promise<void> {
    const existingTour = await this.prismaService.tour.findUnique({
      where: { id },
    });

    if (!existingTour) {
      throw new TourNotFoundException();
    }

    await this.prismaService.tour.delete({
      where: { id },
    });
  }

  async importReceiptPaymentFromTourCalculationToTourImplementation(
    tourId: string,
    currentUserId: string
  ): Promise<void> {
    const tour = await this.prismaService.tour.findUnique({
      where: { id: tourId },
      include: {
        tourCalculation: {
          include: {
            receiptPayments: true,
          },
        },
        tourImplementation: true,
      },
    });

    if (!tour) {
      throw new TourNotFoundException();
    }

    if (!tour.tourCalculation) {
      throw new TourCalculationNotFoundException();
    }

    if (!tour.tourImplementation) {
      throw new TourImplementationNotFoundException();
    }

    const receiptPayments = tour.tourCalculation.receiptPayments;

    if (receiptPayments.length === 0) {
      return;
    }

    const groupCode = RECEIPT_PAYMENT_GROUP_CODE.FOR_DIRECTOR;

    for (const receiptPayment of receiptPayments) {
      const newReceiptPayment = await this.prismaService.receiptPayment.create({
        data: {
          type: receiptPayment.type,
          description: receiptPayment.description,
          unitPrice: receiptPayment.unitPrice,
          currency: receiptPayment.currency,
          transactionType: receiptPayment.transactionType,
          transactionDate: receiptPayment.transactionDate,
          quantity: receiptPayment.quantity,
          frequency: receiptPayment.frequency,
          vatRate: receiptPayment.vatRate,
          note: receiptPayment.note,
          projectId: receiptPayment.projectId,
          organizationId: receiptPayment.organizationId,
          createdByUserId: currentUserId,
        },
      });

      await this.prismaService.tourImplementationReceiptPayment.create({
        data: {
          tourImplementationId: tour.tourImplementation.id,
          receiptPaymentId: newReceiptPayment.id,
          groupCode,
        },
      });
    }
  }
}
