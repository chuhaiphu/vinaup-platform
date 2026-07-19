import { HttpStatus, NotFoundException } from '@nestjs/common';

export class InvoiceNotFoundException extends NotFoundException {
  constructor() {
    super({ error: 'INVOICE_NOT_FOUND', message: 'Invoice not found', statusCode: HttpStatus.NOT_FOUND });
  }
}

export class InvoiceTypeNotFoundException extends NotFoundException {
  constructor() {
    super({ error: 'INVOICE_TYPE_NOT_FOUND', message: 'Invoice type not found', statusCode: HttpStatus.NOT_FOUND });
  }
}
