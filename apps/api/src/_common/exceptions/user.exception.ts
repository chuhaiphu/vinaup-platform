import { HttpStatus, NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
  constructor() {
    super({ error: 'USER_NOT_FOUND', message: 'User not found', statusCode: HttpStatus.NOT_FOUND });
  }
}
