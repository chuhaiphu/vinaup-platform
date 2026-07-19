import { Injectable } from '@nestjs/common';

import { DOCUMENT_TYPE, SIGNATURE_ROLE } from 'src/_common/constants/signature.constant';
import { DocumentLockedAfterSignException } from 'src/_common/exceptions/document.exception';
import { TourCalculationCancelLogNotFoundException, TourCalculationNotFoundException } from 'src/_common/exceptions/tour.exception';
import { Prisma } from 'src/prisma/generated/client';
import { PrismaService } from 'src/prisma/prisma.service';

import { TourCalculationCancelLogResponse } from '../dtos/tour-calculation-cancel-log.response.dto';
import { TourCalculationResponse, TourCalculationWithMeta } from '../dtos/tour-calculation.response.dto';
import { UpdateTourCalculationRequest } from '../dtos/update-tour-calculation.request.dto';

@Injectable()
export class TourCalculationService {
  constructor(private readonly prismaService: PrismaService) {}

  private async isAnyReceiverSigned(
    client: Prisma.TransactionClient | PrismaService,
    tourCalculationId: string
  ): Promise<boolean> {
    const count = await client.signature.count({
      where: {
        documentId: tourCalculationId,
        documentType: DOCUMENT_TYPE.TOUR_CALCULATION,
        signatureRole: SIGNATURE_ROLE.RECEIVER,
        isSigned: true,
      },
    });
    return count > 0;
  }

  async findTourCalculationByTourId(
    tourId: string
  ): Promise<TourCalculationWithMeta> {
    const tourCalculation = await this.prismaService.tourCalculation.findUnique({
      where: { tourId },
      include: {
        createdBy: true,
        tour: true,
      },
    });
    if (!tourCalculation) {
      throw new TourCalculationNotFoundException();
    }
    const anyReceiverSigned = await this.isAnyReceiverSigned(this.prismaService, tourCalculation.id);
    return {
      ...tourCalculation,
      meta: { canEdit: !anyReceiverSigned },
    };
  }

  async findTourCalculationCancelLogsByTourCalculationId(
    tourCalculationId: string
  ): Promise<TourCalculationCancelLogResponse[]> {
    const existingTourCalculation =
      await this.prismaService.tourCalculation.findUnique({
        where: { id: tourCalculationId },
      });

    if (!existingTourCalculation) {
      throw new TourCalculationNotFoundException();
    }

    const cancelLogs = await this.prismaService.tourCalculationCancelLog.findMany({
      where: { tourCalculationId },
      include: {
        canceledByUser: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return cancelLogs;
  }

  async findTourCalculationCancelLogById(
    id: string
  ): Promise<TourCalculationCancelLogResponse> {
    const cancelLog = await this.prismaService.tourCalculationCancelLog.findUnique({
      where: { id },
      include: {
        canceledByUser: true,
      },
    });

    if (!cancelLog) {
      throw new TourCalculationCancelLogNotFoundException();
    }

    return cancelLog;
  }

  async updateTourCalculation(
    tourCalculationId: string,
    updateTourCalculationReq: UpdateTourCalculationRequest
  ): Promise<TourCalculationResponse> {
    const updatedTourCalculation = await this.prismaService.$transaction(
      async (transaction) => {
        const existingTourCalculation =
          await transaction.tourCalculation.findUnique({
            where: { id: tourCalculationId },
          });

        if (!existingTourCalculation) {
          throw new TourCalculationNotFoundException();
        }

        if (await this.isAnyReceiverSigned(transaction, tourCalculationId)) {
          throw new DocumentLockedAfterSignException('Tour Calculation cannot be updated after any receiver signed');
        }

        return transaction.tourCalculation.update({
          where: { id: tourCalculationId },
          data: updateTourCalculationReq,
          include: {
            createdBy: true,
            tour: true,
          },
        });
      }
    );

    return updatedTourCalculation;
  }
}
