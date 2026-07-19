import { HttpStatus, NotFoundException } from '@nestjs/common';

export class WageNotFoundException extends NotFoundException {
  constructor() {
    super({ error: 'WAGE_NOT_FOUND', message: 'Wage not found', statusCode: HttpStatus.NOT_FOUND });
  }
}
