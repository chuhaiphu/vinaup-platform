import { Injectable } from '@nestjs/common';
import {
  BOOKING_STATUS,
  DOCUMENT_TYPE,
  type DocumentType,
  type ManageReceiverSignaturesRequestInterface,
} from '@vinaup-platform/validation';

import { SIGNATURE_ROLE } from 'src/_common/constants/signature.constant';
import { EXTENSION_BY_MIME } from 'src/_common/constants/storage.constant';
import { BookingNotFoundException } from 'src/_common/exceptions/booking.exception';
import { DocumentLockedAfterSignException } from 'src/_common/exceptions/document.exception';
import { InvoiceNotFoundException } from 'src/_common/exceptions/invoice.exception';
import { ProjectNotFoundException } from 'src/_common/exceptions/project.exception';
import {
  SignatureAlreadySignedException,
  SignatureBookingCompletedImmutableException,
  SignatureBookingReceiverOrgMissingException,
  SignatureNotAuthorizedException,
  SignatureNotFoundException,
  SignatureNotReceivingOrgMemberException,
  SignatureReceiverBeforeSenderException,
  SignatureReceiverIncludesSenderException,
  SignatureUnsupportedDocumentTypeException,
} from 'src/_common/exceptions/signature.exception';
import { UploadFailedException } from 'src/_common/exceptions/storage.exception';
import { TourCalculationNotFoundException, TourSettlementNotFoundException } from 'src/_common/exceptions/tour.exception';
import { UserNotFoundException } from 'src/_common/exceptions/user.exception';
import { Prisma, Signature } from 'src/prisma/generated/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { StorageService } from 'src/storage/storage.service';

import {
  signatureQueryArgs,
  toSignatureResponse,
  type SignatureResponse,
} from './dtos/signature.response.dto';

@Injectable()
export class SignatureService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  private buildResetSignatureData() {
    return {
      isSigned: false,
      signedByUserId: null,
      signedByName: null,
      signedAt: null,
    };
  }

  private async findSignatureByIdOrThrow(id: string): Promise<Signature> {
    const signature = await this.prismaService.signature.findUnique({
      where: { id },
    });
    if (!signature) {
      throw new SignatureNotFoundException();
    }
    return signature;
  }

  async findSignatureById(id: string): Promise<SignatureResponse> {
    const signature = await this.prismaService.signature.findUnique({
      where: { id },
      ...signatureQueryArgs,
    });

    if (!signature) {
      throw new SignatureNotFoundException();
    }
    return toSignatureResponse(signature, this.storageService);
  }

  async findSignaturesByDocumentId(
    documentId: string
  ): Promise<SignatureResponse[]> {
    const signatures = await this.prismaService.signature.findMany({
      where: { documentId },
      ...signatureQueryArgs,
    });
    return signatures.map((signature) => toSignatureResponse(signature, this.storageService));
  }

  private async assertCanSign(existingSignature: {
    documentId: string;
    documentType: string;
    signatureRole: string;
  }): Promise<void> {
    if (existingSignature.signatureRole !== SIGNATURE_ROLE.RECEIVER) {
      return;
    }

    const unsignedSenderCount = await this.prismaService.signature.count({
      where: {
        documentId: existingSignature.documentId,
        documentType: existingSignature.documentType,
        signatureRole: SIGNATURE_ROLE.SENDER,
        isSigned: false,
      },
    });

    if (unsignedSenderCount > 0) {
      throw new SignatureReceiverBeforeSenderException();
    }
  }

  async manageReceiverSignatures(
    manageReceiverSignaturesReq: ManageReceiverSignaturesRequestInterface
  ): Promise<SignatureResponse[]> {
    return this.prismaService.$transaction(async (transaction) => {
      await this.assertDocumentExists(
        transaction,
        manageReceiverSignaturesReq.documentId,
        manageReceiverSignaturesReq.documentType
      );

      const existingSignatures = await transaction.signature.findMany({
        where: {
          documentId: manageReceiverSignaturesReq.documentId,
          documentType: manageReceiverSignaturesReq.documentType,
        },
      });

      // Validate that sender signatures are not included in the request
      const senderTargetUserIds = new Set(
        existingSignatures
          .filter((signature) => signature.signatureRole === SIGNATURE_ROLE.SENDER)
          .map((signature) => signature.targetUserId)
      );
      const duplicatedSenderUserId = manageReceiverSignaturesReq.targetUserIds.find(
        (targetUserId) => senderTargetUserIds.has(targetUserId)
      );
      if (duplicatedSenderUserId) {
        throw new SignatureReceiverIncludesSenderException();
      }

      // Validate that if a signed receiver signature is being removed, throw an error
      const receiverSignatures = existingSignatures.filter(
        (signature) => signature.signatureRole === SIGNATURE_ROLE.RECEIVER
      );
      const targetUserIdsSet = new Set(manageReceiverSignaturesReq.targetUserIds);
      const toBeRemovedSignedReceiver = receiverSignatures.find(
        (signature) =>
          signature.isSigned &&
          signature.targetUserId &&
          !targetUserIdsSet.has(signature.targetUserId)
      );
      if (toBeRemovedSignedReceiver) {
        throw new DocumentLockedAfterSignException('Cannot remove a signed receiver signature');
      }

      const existingReceiverTargetUserIdSet = new Set(
        receiverSignatures.map((signature) => signature.targetUserId)
      );

      const receiverSignatureIdsToDelete = receiverSignatures
        .filter(
          (signature) =>
            signature.targetUserId &&
            !signature.isSigned &&
            !targetUserIdsSet.has(signature.targetUserId)
        )
        .map((signature) => signature.id);

      const receiverTargetUserIdsToCreate =
        manageReceiverSignaturesReq.targetUserIds.filter(
          (targetUserId) => !existingReceiverTargetUserIdSet.has(targetUserId)
        );

      if (receiverSignatureIdsToDelete.length > 0) {
        await transaction.signature.deleteMany({
          where: {
            id: {
              in: receiverSignatureIdsToDelete,
            },
          },
        });
      }

      if (receiverTargetUserIdsToCreate.length > 0) {
        await transaction.signature.createMany({
          data: receiverTargetUserIdsToCreate.map((targetUserId) => ({
            documentId: manageReceiverSignaturesReq.documentId,
            documentType: manageReceiverSignaturesReq.documentType,
            signatureRole: SIGNATURE_ROLE.RECEIVER,
            targetUserId,
          })),
        });
      }

      const signatures = await transaction.signature.findMany({
        where: {
          documentId: manageReceiverSignaturesReq.documentId,
          documentType: manageReceiverSignaturesReq.documentType,
        },
        ...signatureQueryArgs,
      });
      return signatures.map((signature) => toSignatureResponse(signature, this.storageService));
    });
  }

  private async assertDocumentExists(
    transaction: Prisma.TransactionClient,
    documentId: string,
    documentType: DocumentType
  ): Promise<void> {
    switch (documentType) {
      case DOCUMENT_TYPE.TOUR_CALCULATION: {
        const existingTourCalculation =
          await transaction.tourCalculation.findUnique({
            where: { id: documentId },
          });
        if (!existingTourCalculation) {
          throw new TourCalculationNotFoundException();
        }
        return;
      }
      case DOCUMENT_TYPE.TOUR_SETTLEMENT: {
        const existingTourSettlement = await transaction.tourSettlement.findUnique({
          where: { id: documentId },
        });
        if (!existingTourSettlement) {
          throw new TourSettlementNotFoundException();
        }
        return;
      }
      case DOCUMENT_TYPE.BOOKING: {
        const existingBooking = await transaction.booking.findUnique({
          where: { id: documentId },
        });
        if (!existingBooking) {
          throw new BookingNotFoundException();
        }
        return;
      }
      case DOCUMENT_TYPE.INVOICE: {
        const existingInvoice = await transaction.invoice.findUnique({
          where: { id: documentId },
        });
        if (!existingInvoice) {
          throw new InvoiceNotFoundException();
        }
        return;
      }
      case DOCUMENT_TYPE.PROJECT: {
        const existingProject = await transaction.project.findUnique({
          where: { id: documentId },
        });
        if (!existingProject) {
          throw new ProjectNotFoundException();
        }
        return;
      }
      default:
        throw new SignatureUnsupportedDocumentTypeException();
    }
  }

  async updateSignatureImage(
    id: string,
    file: Express.Multer.File,
    currentUserId: string
  ): Promise<SignatureResponse> {
    const existingSignature = await this.findSignatureByIdOrThrow(id);

    // If targetUserId is specified, only that user can replace the image
    // If not specified, anyone in the organization can replace it
    if (
      existingSignature.targetUserId &&
      existingSignature.targetUserId !== currentUserId
    ) {
      throw new SignatureNotAuthorizedException();
    }

    // Server-generated key; the extension comes from the VERIFIED mime type
    const extension = EXTENSION_BY_MIME[file.mimetype];
    const signatureKey = `signatures/${existingSignature.id}-${Date.now()}.${extension}`;

    try {
      await this.storageService.put(signatureKey, file.buffer, file.mimetype);
    } catch {
      throw new UploadFailedException();
    }

    // Only point at the new image, don't change isSigned status
    const updatedSignature = await this.prismaService.signature.update({
      where: { id: existingSignature.id },
      data: { signatureKey },
      ...signatureQueryArgs,
    });

    // Best-effort prune of the previous object — a cleanup failure must NOT fail the request
    if (existingSignature.signatureKey) {
      try {
        await this.storageService.delete(existingSignature.signatureKey);
      } catch {
        // swallow — an orphaned object is a cleanup problem, not a user-facing one
      }
    }

    return toSignatureResponse(updatedSignature, this.storageService);
  }

  async signSignature(
    id: string,
    currentUserId: string
  ): Promise<SignatureResponse> {
    const existingSignature = await this.findSignatureByIdOrThrow(id);

    // Check if already signed
    if (existingSignature.isSigned) {
      throw new SignatureAlreadySignedException();
    }

    // If targetUserId is specified, only that user can sign
    if (existingSignature.targetUserId && existingSignature.targetUserId !== currentUserId) {
      throw new SignatureNotAuthorizedException();
    }

    // BOOKING RECEIVER: user must belong to the clientOrganization
    if (
      existingSignature.signatureRole === SIGNATURE_ROLE.RECEIVER &&
      existingSignature.documentType === DOCUMENT_TYPE.BOOKING
    ) {
      await this.assertReceiverIsClientOrgMember(existingSignature.documentId, currentUserId);
    }

    await this.assertCanSign(existingSignature);

    // Get current user information
    const currentUser = await this.prismaService.user.findUnique({
      where: { id: currentUserId },
    });

    if (!currentUser) {
      throw new UserNotFoundException();
    }

    // Update signature with signer information and timestamp
    const updatedSignature = await this.prismaService.signature.update({
      where: { id: existingSignature.id },
      data: {
        signedByUserId: currentUserId,
        signedByName: currentUser.name,
        signedAt: new Date(),
        isSigned: true,
      },
      ...signatureQueryArgs,
    });

    await this.syncBookingStatusAfterSign(existingSignature.documentId, existingSignature.documentType, existingSignature.signatureRole);

    return toSignatureResponse(updatedSignature, this.storageService);
  }

  private async assertReceiverIsClientOrgMember(
    bookingId: string,
    currentUserId: string,
  ): Promise<void> {
    const booking = await this.prismaService.booking.findUnique({
      where: { id: bookingId },
      include: { organizationCustomer: true },
    });

    const clientOrganizationId = booking?.organizationCustomer?.clientOrganizationId;
    if (!clientOrganizationId) {
      throw new SignatureBookingReceiverOrgMissingException();
    }

    const isMember = await this.prismaService.organizationMember.findFirst({
      where: { organizationId: clientOrganizationId, userId: currentUserId },
    });

    if (!isMember) {
      throw new SignatureNotReceivingOrgMemberException();
    }
  }

  private async syncBookingStatusAfterSign(
    documentId: string,
    documentType: string,
    signatureRole: string,
  ): Promise<void> {
    if (documentType !== DOCUMENT_TYPE.BOOKING) return;

    if (signatureRole === SIGNATURE_ROLE.SENDER) {
      await this.prismaService.booking.update({
        where: { id: documentId },
        data: { status: 'SENDER_SIGNED' },
      });
    } else if (signatureRole === SIGNATURE_ROLE.RECEIVER) {
      await this.prismaService.booking.update({
        where: { id: documentId },
        data: { status: 'COMPLETED' },
      });
    }
  }

  async handleCancelSignature(
    signatureId: string,
    currentUserId: string
  ): Promise<SignatureResponse> {
    const existingSignature = await this.findSignatureByIdOrThrow(signatureId);

    if (
      existingSignature.documentType !== DOCUMENT_TYPE.TOUR_CALCULATION &&
      existingSignature.documentType !== DOCUMENT_TYPE.TOUR_SETTLEMENT &&
      existingSignature.documentType !== DOCUMENT_TYPE.BOOKING
    ) {
      throw new SignatureUnsupportedDocumentTypeException();
    }

    // Only signer or target user can cancel the signature
    if (existingSignature.targetUserId) {
      if (existingSignature.targetUserId !== currentUserId) {
        throw new SignatureNotAuthorizedException();
      }
    } else if (existingSignature.signedByUserId !== currentUserId) {
      throw new SignatureNotAuthorizedException();
    }

    return this.prismaService.$transaction(async (transaction) => {
      if (existingSignature.documentType === DOCUMENT_TYPE.BOOKING) {
        const booking = await transaction.booking.findUnique({
          where: { id: existingSignature.documentId },
        });

        if (booking?.status === BOOKING_STATUS.COMPLETED) {
          throw new SignatureBookingCompletedImmutableException();
        }

        await transaction.signature.updateMany({
          where: {
            documentId: existingSignature.documentId,
            documentType: existingSignature.documentType,
          },
          data: this.buildResetSignatureData(),
        });

        await transaction.booking.update({
          where: { id: existingSignature.documentId },
          data: { status: BOOKING_STATUS.DRAFT },
        });

        const updatedSignature = await transaction.signature.findUnique({
          where: { id: existingSignature.id },
          ...signatureQueryArgs,
        });

        if (!updatedSignature) {
          throw new SignatureNotFoundException();
        }

        return toSignatureResponse(updatedSignature, this.storageService);
      }

      let snapshotData: Prisma.InputJsonValue;

      if (existingSignature.documentType === DOCUMENT_TYPE.TOUR_CALCULATION) {
        const tourCalculationSnapshot =
          await transaction.tourCalculation.findUnique({
            where: { id: existingSignature.documentId },
            include: {
              createdBy: true,
              tour: true,
              receiptPayments: true,
            },
          });

        if (!tourCalculationSnapshot) {
          throw new TourCalculationNotFoundException();
        }

        const signatureSnapshot = await transaction.signature.findMany({
          where: { documentId: existingSignature.documentId },
          ...signatureQueryArgs,
        });

        snapshotData = JSON.parse(
          JSON.stringify({
            tourCalculation: tourCalculationSnapshot,
            signatures: signatureSnapshot,
          })
        ) as Prisma.InputJsonValue;

        await transaction.tourCalculationCancelLog.create({
          data: {
            tourCalculationId: existingSignature.documentId,
            canceledByUserId: currentUserId,
            snapshotData,
          },
        });
      } else {
        const tourSettlementSnapshot =
          await transaction.tourSettlement.findUnique({
            where: { id: existingSignature.documentId },
            include: {
              createdBy: true,
              tour: true,
              receiptPayments: true,
            },
          });

        if (!tourSettlementSnapshot) {
          throw new TourSettlementNotFoundException();
        }

        const signatureSnapshot = await transaction.signature.findMany({
          where: { documentId: existingSignature.documentId },
          ...signatureQueryArgs,
        });

        snapshotData = JSON.parse(
          JSON.stringify({
            tourSettlement: tourSettlementSnapshot,
            signatures: signatureSnapshot,
          })
        ) as Prisma.InputJsonValue;

        await transaction.tourSettlementCancelLog.create({
          data: {
            tourSettlementId: existingSignature.documentId,
            canceledByUserId: currentUserId,
            snapshotData,
          },
        });
      }

      await transaction.signature.updateMany({
        where: {
          documentId: existingSignature.documentId,
          documentType: existingSignature.documentType,
        },
        data: this.buildResetSignatureData(),
      });

      const updatedSignature = await transaction.signature.findUnique({
        where: { id: existingSignature.id },
        ...signatureQueryArgs,
      });

      if (!updatedSignature) {
        throw new SignatureNotFoundException();
      }

      return toSignatureResponse(updatedSignature, this.storageService);
    });
  }
}
