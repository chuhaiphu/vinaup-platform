import { Injectable } from '@nestjs/common';
import {
  BOOKING_STATUS,
  DOCUMENT_TYPE,
  type BookingFilterRequestInterface,
  type CreateBookingRequestInterface,
  type UpdateBookingRequestInterface,
} from '@vinaup-platform/validation';

import { SIGNATURE_ROLE } from 'src/_common/constants/signature.constant';
import { BookingAccessDeniedException, BookingCompletedImmutableException, BookingNotFoundException } from 'src/_common/exceptions/booking.exception';
import { DocumentLockedAfterSignException } from 'src/_common/exceptions/document.exception';
import { OrganizationNotFoundException } from 'src/_common/exceptions/organization.exception';
import { TourImplementationNotFoundException } from 'src/_common/exceptions/tour.exception';
import { generateDateOverlapClause } from 'src/_common/utils/generator/generate-date-overlap-clause';
import { PrismaService } from 'src/prisma/prisma.service';
import { StorageService } from 'src/storage/storage.service';

import { toBookingResponse, bookingQueryArgs, type BookingResponse, type BookingWithMeta } from './dtos/booking.response.dto';

@Injectable()
export class BookingService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async findBookingsByOrganizationId(
    organizationId: string,
    filter?: BookingFilterRequestInterface
  ): Promise<BookingWithMeta[]> {
    const dateFilterClause = generateDateOverlapClause(filter);

    const whereClause = {
      organizationId: organizationId,
      ...(filter?.status && { status: filter.status }),
      ...dateFilterClause,
    };

    const bookings = await this.prismaService.booking.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      ...bookingQueryArgs,
    });

    if (!bookings.length) {
      return [];
    }

    const bookingIds = bookings.map((b) => b.id);

    // Fetch signatures for all bookings using one query only
    const signedSignatures = await this.prismaService.signature.findMany({
      where: {
        documentType: DOCUMENT_TYPE.BOOKING,
        documentId: { in: bookingIds },
        isSigned: true,
      },
    });

    const signedSenderDocumentIds = new Set(
      signedSignatures.filter((sig) => sig.signatureRole === SIGNATURE_ROLE.SENDER).map((sig) => sig.documentId)
    );
    const signedReceiverDocumentIds = new Set(
      signedSignatures.filter((sig) => sig.signatureRole === SIGNATURE_ROLE.RECEIVER).map((sig) => sig.documentId)
    );

    const bookingsWithMeta: BookingWithMeta[] =
      bookings.map((booking) => ({
        ...toBookingResponse(booking, this.storageService),
        meta: {
          isSender: true,
          canEdit: !signedSenderDocumentIds.has(booking.id),
          isSenderSigned: signedSenderDocumentIds.has(booking.id),
          isReceiverSigned: signedReceiverDocumentIds.has(booking.id),
        },
      }));

    return bookingsWithMeta;
  }

  private async assertBookingRelationsExist(input: {
    organizationId?: string;
    tourImplementationId?: string | null;
  }): Promise<void> {
    if (input.organizationId) {
      const organization = await this.prismaService.organization.findUnique({
        where: { id: input.organizationId },
        select: { id: true },
      });
      if (!organization) throw new OrganizationNotFoundException();
    }
    if (input.tourImplementationId) {
      const tourImplementation = await this.prismaService.tourImplementation.findUnique({
        where: { id: input.tourImplementationId },
        select: { id: true },
      });
      if (!tourImplementation) throw new TourImplementationNotFoundException();
    }
  }

  async createBooking(
    createBookingReq: CreateBookingRequestInterface,
    currentUserId: string
  ): Promise<BookingResponse> {
    await this.assertBookingRelationsExist(createBookingReq);

    const newBooking = await this.prismaService.booking.create({
      data: {
        ...createBookingReq,
        createdByUserId: currentUserId,
        status: BOOKING_STATUS.DRAFT,
      },
      ...bookingQueryArgs,
    });

    await this.prismaService.signature.createMany({
      data: [
        {
          signatureRole: SIGNATURE_ROLE.SENDER,
          documentId: newBooking.id,
          documentType: DOCUMENT_TYPE.BOOKING,
          targetUserId: currentUserId,
        },
        {
          signatureRole: SIGNATURE_ROLE.RECEIVER,
          documentId: newBooking.id,
          documentType: DOCUMENT_TYPE.BOOKING,
        },
      ],
    });

    return toBookingResponse(newBooking, this.storageService);
  }

  async updateBooking(
    id: string,
    updateBookingReq: UpdateBookingRequestInterface
  ): Promise<BookingResponse> {
    const existingBooking = await this.prismaService.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      throw new BookingNotFoundException();
    }

    await this.assertBookingRelationsExist(updateBookingReq);

    const signedSenderSignature = await this.prismaService.signature.findFirst({
      where: {
        documentId: id,
        documentType: DOCUMENT_TYPE.BOOKING,
        signatureRole: SIGNATURE_ROLE.SENDER,
        isSigned: true,
      },
    });
    if (signedSenderSignature) {
      throw new DocumentLockedAfterSignException('Booking cannot be updated after sender has signed');
    }

    const updatedBooking = await this.prismaService.booking.update({
      where: { id },
      data: updateBookingReq,
      ...bookingQueryArgs,
    });

    return toBookingResponse(updatedBooking, this.storageService);
  }

  async deleteBookingById(id: string): Promise<void> {
    const existingBooking = await this.prismaService.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      throw new BookingNotFoundException();
    }

    if (existingBooking.status === BOOKING_STATUS.COMPLETED) {
      throw new BookingCompletedImmutableException();
    }

    await this.prismaService.booking.delete({
      where: { id },
    });
  }

  async findBookingById(
    id: string,
    currentUserId: string
  ): Promise<BookingWithMeta> {
    const booking = await this.prismaService.booking.findUnique({
      where: { id },
      ...bookingQueryArgs,
    });

    if (!booking) {
      throw new BookingNotFoundException();
    }

    const [signatureList, currentUserOrganizationIds] = await Promise.all([
      this.prismaService.signature.findMany({
        where: { documentId: id, documentType: DOCUMENT_TYPE.BOOKING },
      }),
      this.prismaService.organizationMember.findMany({
        where: { userId: currentUserId },
        select: { organizationId: true },
      }).then(members => members.map(m => m.organizationId)),
    ]);

    const isSender =
      booking.createdByUserId === currentUserId ||
      currentUserOrganizationIds.includes(booking.organizationId);

    const receiverOrganizationId = booking.organizationCustomer?.clientOrganizationId;
    const isReceiver =
      !!receiverOrganizationId && currentUserOrganizationIds.includes(receiverOrganizationId);

    const isSignatureTarget = signatureList.some(
      (signature) => signature.targetUserId === currentUserId
    );

    if (!isSender && !isReceiver && !isSignatureTarget) {
      throw new BookingAccessDeniedException();
    }

    const isSenderSigned = signatureList.some(
      (signature) => signature.signatureRole === SIGNATURE_ROLE.SENDER && signature.isSigned
    );
    const isReceiverSigned = signatureList.some(
      (signature) => signature.signatureRole === SIGNATURE_ROLE.RECEIVER && signature.isSigned
    );

    return {
      ...toBookingResponse(booking, this.storageService),
      meta: {
        isSender,
        canEdit: isSender && !isSenderSigned,
        isSenderSigned,
        isReceiverSigned,
      },
    };
  }

  async findBookingsByOrganizationCustomerOrganizationId(
    organizationId: string,
    filter?: BookingFilterRequestInterface
  ): Promise<BookingWithMeta[]> {
    const dateFilterClause = generateDateOverlapClause(filter);

    const whereClause = {
      organizationCustomer: {
        clientOrganizationId: organizationId,
      },
      ...(filter?.status && { status: filter.status }),
      ...dateFilterClause,
    };

    const bookings = await this.prismaService.booking.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      ...bookingQueryArgs,
    });

    if (!bookings.length) {
      return [];
    }

    const bookingIds = bookings.map((b) => b.id);

    const signedSignatures = await this.prismaService.signature.findMany({
      where: {
        documentType: DOCUMENT_TYPE.BOOKING,
        documentId: { in: bookingIds },
        isSigned: true,
      },
    });

    const signedSenderDocumentIds = new Set(
      signedSignatures.filter((sig) => sig.signatureRole === SIGNATURE_ROLE.SENDER).map((sig) => sig.documentId)
    );
    const signedReceiverDocumentIds = new Set(
      signedSignatures.filter((sig) => sig.signatureRole === SIGNATURE_ROLE.RECEIVER).map((sig) => sig.documentId)
    );

    const bookingsWithMeta: BookingWithMeta[] =
      bookings.map((booking) => ({
        ...toBookingResponse(booking, this.storageService),
        meta: {
          isSender: false,
          canEdit: false,
          isSenderSigned: signedSenderDocumentIds.has(booking.id),
          isReceiverSigned: signedReceiverDocumentIds.has(booking.id),
        },
      }));

    return bookingsWithMeta;
  }

  async findBookingsByTourImplementationId(
    tourImplementationId: string,
    filter?: BookingFilterRequestInterface
  ): Promise<BookingResponse[]> {
    const dateFilterClause = generateDateOverlapClause(filter);

    const whereClause = {
      tourImplementationId: tourImplementationId,
      ...(filter?.status && { status: filter.status }),
      ...dateFilterClause,
    };

    const bookings = await this.prismaService.booking.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      ...bookingQueryArgs,
    });

    return bookings.map((row) => toBookingResponse(row, this.storageService));
  }
}
