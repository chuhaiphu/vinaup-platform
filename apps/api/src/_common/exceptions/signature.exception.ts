import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';

export class SignatureNotFoundException extends NotFoundException {
  constructor() {
    super({ error: 'SIGNATURE_NOT_FOUND', message: 'Signature not found', statusCode: HttpStatus.NOT_FOUND });
  }
}

export class SignatureAlreadySignedException extends BadRequestException {
  constructor() {
    super({ error: 'SIGNATURE_ALREADY_SIGNED', message: 'Signature has already been signed', statusCode: HttpStatus.BAD_REQUEST });
  }
}

export class SignatureNotAuthorizedException extends ForbiddenException {
  constructor() {
    super({ error: 'SIGNATURE_NOT_AUTHORIZED', message: 'You are not authorized to perform this action on the signature', statusCode: HttpStatus.FORBIDDEN });
  }
}

export class SignatureReceiverBeforeSenderException extends BadRequestException {
  constructor() {
    super({ error: 'SIGNATURE_RECEIVER_BEFORE_SENDER', message: 'Receiver cannot sign before sender has signed', statusCode: HttpStatus.BAD_REQUEST });
  }
}

export class SignatureReceiverIncludesSenderException extends BadRequestException {
  constructor() {
    super({ error: 'SIGNATURE_RECEIVER_INCLUDES_SENDER', message: 'Receiver signatures cannot include a sender user', statusCode: HttpStatus.BAD_REQUEST });
  }
}

export class SignatureUnsupportedDocumentTypeException extends BadRequestException {
  constructor() {
    super({ error: 'SIGNATURE_UNSUPPORTED_DOCUMENT_TYPE', message: 'Unsupported document type', statusCode: HttpStatus.BAD_REQUEST });
  }
}

export class SignatureBookingCompletedImmutableException extends BadRequestException {
  constructor() {
    super({ error: 'SIGNATURE_BOOKING_COMPLETED_IMMUTABLE', message: 'Cannot cancel a signature on a completed booking', statusCode: HttpStatus.BAD_REQUEST });
  }
}

export class SignatureBookingReceiverOrgMissingException extends BadRequestException {
  constructor() {
    super({ error: 'SIGNATURE_BOOKING_RECEIVER_ORG_MISSING', message: 'The booking has no receiver linked to an organization', statusCode: HttpStatus.BAD_REQUEST });
  }
}

export class SignatureNotReceivingOrgMemberException extends ForbiddenException {
  constructor() {
    super({ error: 'SIGNATURE_NOT_RECEIVING_ORG_MEMBER', message: 'You are not a member of the receiving organization', statusCode: HttpStatus.FORBIDDEN });
  }
}
