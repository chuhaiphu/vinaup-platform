import { ForbiddenException, HttpStatus, NotFoundException } from '@nestjs/common';

export class ReceiptPaymentNotFoundException extends NotFoundException {
  constructor() {
    super({ error: 'RECEIPT_PAYMENT_NOT_FOUND', message: 'Receipt payment not found', statusCode: HttpStatus.NOT_FOUND });
  }
}

export class ReceiptPaymentCategoryNotFoundException extends NotFoundException {
  constructor() {
    super({ error: 'RECEIPT_PAYMENT_CATEGORY_NOT_FOUND', message: 'Receipt payment category not found', statusCode: HttpStatus.NOT_FOUND });
  }
}

export class ReceiptPaymentCategorySystemReadonlyException extends ForbiddenException {
  constructor() {
    super({ error: 'RECEIPT_PAYMENT_CATEGORY_SYSTEM_READONLY', message: 'System categories cannot be modified', statusCode: HttpStatus.FORBIDDEN });
  }
}

export class ReceiptPaymentTourImplementationAccessDeniedException extends ForbiddenException {
  constructor() {
    super({ error: 'RECEIPT_PAYMENT_TOUR_IMPLEMENTATION_ACCESS_DENIED', message: 'You are not an assigned member or assigned user of this tour implementation', statusCode: HttpStatus.FORBIDDEN });
  }
}
