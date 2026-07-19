import { Injectable } from '@nestjs/common';
import { DOCUMENT_TYPE } from '@vinaup-platform/validation';

import { SIGNATURE_ROLE } from 'src/_common/constants/signature.constant';
import { DocumentLockedAfterSignException } from 'src/_common/exceptions/document.exception';
import { TourSettlementCancelLogNotFoundException, TourSettlementNotFoundException } from 'src/_common/exceptions/tour.exception';
import { Prisma } from 'src/prisma/generated/client';
import { PrismaService } from 'src/prisma/prisma.service';

import { TourSettlementCancelLogResponse } from '../dtos/tour-settlement-cancel-log.response.dto';
import { TourSettlementResponse, TourSettlementWithMeta } from '../dtos/tour-settlement.response.dto';
import { UpdateTourSettlementRequest } from '../dtos/update-tour-settlement.request.dto';

@Injectable()
export class TourSettlementService {
  constructor(private readonly prismaService: PrismaService) {}

  private async isAnyReceiverSigned(
    client: Prisma.TransactionClient | PrismaService,
    tourSettlementId: string
  ): Promise<boolean> {
    const count = await client.signature.count({
      where: {
        documentId: tourSettlementId,
        documentType: DOCUMENT_TYPE.TOUR_SETTLEMENT,
        signatureRole: SIGNATURE_ROLE.RECEIVER,
        isSigned: true,
      },
    });
    return count > 0;
  }

  async findTourSettlementByTourId(
    tourId: string
  ): Promise<TourSettlementWithMeta> {
    const tourSettlement = await this.prismaService.tourSettlement.findUnique({
      where: { tourId },
      include: {
        createdBy: true,
        tour: true,
      },
    });
    if (!tourSettlement) {
      throw new TourSettlementNotFoundException();
    }
    const anyReceiverSigned = await this.isAnyReceiverSigned(this.prismaService, tourSettlement.id);
    return {
      ...tourSettlement,
      meta: { canEdit: !anyReceiverSigned },
    };
  }

  async updateTourSettlement(
    tourSettlementId: string,
    updateTourSettlementReq: UpdateTourSettlementRequest
  ): Promise<TourSettlementResponse> {
    return this.prismaService.$transaction(async (transaction) => {
      const existingTourSettlement =
        await transaction.tourSettlement.findUnique({
          where: { id: tourSettlementId },
        });

      if (!existingTourSettlement) {
        throw new TourSettlementNotFoundException();
      }

      if (await this.isAnyReceiverSigned(transaction, tourSettlementId)) {
        throw new DocumentLockedAfterSignException('Tour Settlement cannot be updated after any receiver signed');
      }

      return transaction.tourSettlement.update({
        where: { id: tourSettlementId },
        data: updateTourSettlementReq,
        include: {
          createdBy: true,
          tour: true,
        },
      });
    });
  }

  async findTourSettlementCancelLogsByTourSettlementId(
    tourSettlementId: string
  ): Promise<TourSettlementCancelLogResponse[]> {
    const existingTourSettlement =
      await this.prismaService.tourSettlement.findUnique({
        where: { id: tourSettlementId },
      });

    if (!existingTourSettlement) {
      throw new TourSettlementNotFoundException();
    }

    const cancelLogs =
      await this.prismaService.tourSettlementCancelLog.findMany({
        where: { tourSettlementId },
        include: {
          canceledByUser: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

    return cancelLogs;
  }

  async findTourSettlementCancelLogById(
    id: string
  ): Promise<TourSettlementCancelLogResponse> {
    const cancelLog =
      await this.prismaService.tourSettlementCancelLog.findUnique({
        where: { id },
        include: {
          canceledByUser: true,
        },
      });

    if (!cancelLog) {
      throw new TourSettlementCancelLogNotFoundException();
    }

    return cancelLog;
  }
}
