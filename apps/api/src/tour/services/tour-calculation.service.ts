import { Injectable } from '@nestjs/common';
import {
  type UpdateTourCalculationRequestInterface,
} from '@vinaup-platform/validation';
import { DOCUMENT_TYPE } from '@vinaup-platform/validation';

import { SIGNATURE_ROLE } from 'src/_common/constants/signature.constant';
import { DocumentLockedAfterSignException } from 'src/_common/exceptions/document.exception';
import { TourCalculationCancelLogNotFoundException, TourCalculationNotFoundException } from 'src/_common/exceptions/tour.exception';
import { Prisma } from 'src/prisma/generated/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { StorageService } from 'src/storage/storage.service';

import {
  toTourCalculationCancelLogResponse,
  tourCalculationCancelLogQueryArgs,
  type TourCalculationCancelLogResponse,
} from '../dtos/tour-calculation-cancel-log.response.dto';
import {
  toTourCalculationResponse,
  tourCalculationQueryArgs,
  type TourCalculationResponse,
  type TourCalculationWithMeta,
} from '../dtos/tour-calculation.response.dto';

@Injectable()
export class TourCalculationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly storageService: StorageService,
  ) {}

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
      ...tourCalculationQueryArgs,
    });
    if (!tourCalculation) {
      throw new TourCalculationNotFoundException();
    }
    const anyReceiverSigned = await this.isAnyReceiverSigned(this.prismaService, tourCalculation.id);
    return {
      ...toTourCalculationResponse(tourCalculation, this.storageService),
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
      ...tourCalculationCancelLogQueryArgs,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return cancelLogs.map((cancelLog) => toTourCalculationCancelLogResponse(cancelLog, this.storageService));
  }

  async findTourCalculationCancelLogById(
    id: string
  ): Promise<TourCalculationCancelLogResponse> {
    const cancelLog = await this.prismaService.tourCalculationCancelLog.findUnique({
      where: { id },
      ...tourCalculationCancelLogQueryArgs,
    });

    if (!cancelLog) {
      throw new TourCalculationCancelLogNotFoundException();
    }

    return toTourCalculationCancelLogResponse(cancelLog, this.storageService);
  }

  async updateTourCalculation(
    tourCalculationId: string,
    updateTourCalculationReq: UpdateTourCalculationRequestInterface
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
          ...tourCalculationQueryArgs,
        });
      }
    );

    return toTourCalculationResponse(updatedTourCalculation, this.storageService);
  }
}
