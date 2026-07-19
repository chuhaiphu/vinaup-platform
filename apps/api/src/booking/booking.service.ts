import { Injectable } from '@nestjs/common';

import { BOOKING_STATUS } from 'src/_common/constants/booking.constant';
import { DOCUMENT_TYPE, SIGNATURE_ROLE } from 'src/_common/constants/signature.constant';
import { BookingCompletedImmutableException, BookingNotFoundException } from 'src/_common/exceptions/booking.exception';
import { DocumentLockedAfterSignException } from 'src/_common/exceptions/document.exception';
import { generateDateOverlapClause } from 'src/_common/utils/generator/generate-date-overlap-clause';
import { PrismaService } from 'src/prisma/prisma.service';

import { BookingFilterParam } from './dtos/booking-filter.param.dto';
import { BookingResponse, BookingWithMeta } from './dtos/booking.response.dto';
import { CreateBookingRequest } from './dtos/create-booking.request.dto';
import { UpdateBookingRequest } from './dtos/update-booking.request.dto';

@Injectable()
export class BookingService {
  constructor(private readonly prismaService: PrismaService) {}

  async findBookingsByOrganizationId(
    organizationId: string,
    filter?: BookingFilterParam
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
      include: {
        createdBy: true,
        organization: true,
        organizationCustomer: true,
        tourImplementation: true,
      },
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
        ...booking,
        meta: {
          isSender: true,
          canEdit: !signedSenderDocumentIds.has(booking.id),
          isSenderSigned: signedSenderDocumentIds.has(booking.id),
          isReceiverSigned: signedReceiverDocumentIds.has(booking.id),
        },
      }));

    return bookingsWithMeta;
  }

  async createBooking(
    createBookingReq: CreateBookingRequest,
    currentUserId: string
  ): Promise<BookingResponse> {
    const newBooking = await this.prismaService.booking.create({
      data: {
        ...createBookingReq,
        createdByUserId: currentUserId,
        status: BOOKING_STATUS.DRAFT,
      },
      include: {
        createdBy: true,
        organization: true,
        organizationCustomer: true,
        tourImplementation: true,
      },
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

    return newBooking;
  }

  async updateBooking(
    id: string,
    updateBookingReq: UpdateBookingRequest
  ): Promise<BookingResponse> {
    const existingBooking = await this.prismaService.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      throw new BookingNotFoundException();
    }

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
      include: {
        createdBy: true,
        organization: true,
        organizationCustomer: true,
        tourImplementation: true,
      },
    });

    return updatedBooking;
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
      include: {
        createdBy: true,
        organization: true,
        organizationCustomer: true,
        tourImplementation: true,
      },
    });

    if (!booking) {
      throw new BookingNotFoundException();
    }

    const [signedSenderSignature, signedReceiverSignature, currentUserOrganizationIds] = await Promise.all([
      this.prismaService.signature.findFirst({
        where: { documentId: id, documentType: DOCUMENT_TYPE.BOOKING, signatureRole: SIGNATURE_ROLE.SENDER, isSigned: true },
      }),
      this.prismaService.signature.findFirst({
        where: { documentId: id, documentType: DOCUMENT_TYPE.BOOKING, signatureRole: SIGNATURE_ROLE.RECEIVER, isSigned: true },
      }),
      this.prismaService.organizationMember.findMany({
        where: { userId: currentUserId },
        select: { organizationId: true },
      }).then(members => members.map(m => m.organizationId)),
    ]);

    const isSender =
      booking.createdByUserId === currentUserId ||
      currentUserOrganizationIds.includes(booking.organizationId);

    return {
      ...booking,
      meta: {
        isSender,
        canEdit: isSender && !signedSenderSignature,
        isSenderSigned: !!signedSenderSignature,
        isReceiverSigned: !!signedReceiverSignature,
      },
    };
  }

  async findBookingsByOrganizationCustomerOrganizationId(
    organizationId: string,
    filter?: BookingFilterParam
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
      include: {
        createdBy: true,
        organization: true,
        organizationCustomer: true,
        tourImplementation: true,
      },
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
        ...booking,
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
    filter?: BookingFilterParam
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
      include: {
        createdBy: true,
        organization: true,
        organizationCustomer: true,
        tourImplementation: true,
      },
    });

    return bookings;
  }
}
