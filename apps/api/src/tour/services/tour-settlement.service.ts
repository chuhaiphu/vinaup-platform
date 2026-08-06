import { Injectable } from '@nestjs/common';
import {
  type UpdateTourSettlementRequestInterface,
} from '@vinaup-platform/validation';
import { DOCUMENT_TYPE } from '@vinaup-platform/validation';

import { SIGNATURE_ROLE } from 'src/_common/constants/signature.constant';
import { DocumentLockedAfterSignException } from 'src/_common/exceptions/document.exception';
import { TourSettlementCancelLogNotFoundException, TourSettlementNotFoundException } from 'src/_common/exceptions/tour.exception';
import { Prisma } from 'src/prisma/generated/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { StorageService } from 'src/storage/storage.service';

import {
  toTourSettlementCancelLogResponse,
  tourSettlementCancelLogQueryArgs,
  type TourSettlementCancelLogResponse,
} from '../dtos/tour-settlement-cancel-log.response.dto';
import {
  toTourSettlementResponse,
  tourSettlementQueryArgs,
  type TourSettlementResponse,
  type TourSettlementWithMeta,
} from '../dtos/tour-settlement.response.dto';

@Injectable()
export class TourSettlementService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly storageService: StorageService,
  ) {}

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
      ...tourSettlementQueryArgs,
    });
    if (!tourSettlement) {
      throw new TourSettlementNotFoundException();
    }
    const anyReceiverSigned = await this.isAnyReceiverSigned(this.prismaService, tourSettlement.id);
    return {
      ...toTourSettlementResponse(tourSettlement, this.storageService),
      meta: { canEdit: !anyReceiverSigned },
    };
  }

  async updateTourSettlement(
    tourSettlementId: string,
    updateTourSettlementReq: UpdateTourSettlementRequestInterface
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

      const updatedTourSettlement = await transaction.tourSettlement.update({
        where: { id: tourSettlementId },
        data: updateTourSettlementReq,
        ...tourSettlementQueryArgs,
      });

      return toTourSettlementResponse(updatedTourSettlement, this.storageService);
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
        ...tourSettlementCancelLogQueryArgs,
        orderBy: {
          createdAt: 'desc',
        },
      });

    return cancelLogs.map((cancelLog) =>
      toTourSettlementCancelLogResponse(cancelLog, this.storageService),
    );
  }

  async findTourSettlementCancelLogById(
    id: string
  ): Promise<TourSettlementCancelLogResponse> {
    const cancelLog =
      await this.prismaService.tourSettlementCancelLog.findUnique({
        where: { id },
        ...tourSettlementCancelLogQueryArgs,
      });

    if (!cancelLog) {
      throw new TourSettlementCancelLogNotFoundException();
    }

    return toTourSettlementCancelLogResponse(cancelLog, this.storageService);
  }
}
