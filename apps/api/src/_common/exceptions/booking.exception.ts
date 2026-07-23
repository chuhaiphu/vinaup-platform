import { BadRequestException, ForbiddenException, HttpStatus, NotFoundException } from '@nestjs/common';

export class BookingNotFoundException extends NotFoundException {
  constructor() {
    super({ error: 'BOOKING_NOT_FOUND', message: 'Booking not found', statusCode: HttpStatus.NOT_FOUND });
  }
}

export class BookingAccessDeniedException extends ForbiddenException {
  constructor() {
    super({ error: 'BOOKING_ACCESS_DENIED', message: 'You do not have access to this booking', statusCode: HttpStatus.FORBIDDEN });
  }
}

export class BookingCompletedImmutableException extends BadRequestException {
  constructor() {
    super({ error: 'BOOKING_COMPLETED_IMMUTABLE', message: 'Cannot delete a completed booking', statusCode: HttpStatus.BAD_REQUEST });
  }
}
