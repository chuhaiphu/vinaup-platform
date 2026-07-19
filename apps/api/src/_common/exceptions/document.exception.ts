import { ConflictException, HttpStatus } from '@nestjs/common';

// One code for every "frozen because signing has progressed" state, 
// across all signable document types (booking, tour calculation/settlement, signature).
export class DocumentLockedAfterSignException extends ConflictException {
  constructor(message: string) {
    super({ error: 'DOCUMENT_LOCKED_AFTER_SIGN', message, statusCode: HttpStatus.CONFLICT });
  }
}
