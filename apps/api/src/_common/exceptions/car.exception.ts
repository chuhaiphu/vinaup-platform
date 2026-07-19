import { ConflictException, HttpStatus, NotFoundException } from '@nestjs/common';

export class CarNotFoundException extends NotFoundException {
  constructor() {
    super({ error: 'CAR_NOT_FOUND', message: 'Car not found', statusCode: HttpStatus.NOT_FOUND });
  }
}

export class CarLockedException extends ConflictException {
  constructor() {
    super({ error: 'CAR_LOCKED', message: 'Car is locked and cannot be assigned', statusCode: HttpStatus.CONFLICT });
  }
}

export class CarMaintenanceLogNotFoundException extends NotFoundException {
  constructor() {
    super({ error: 'CAR_MAINTENANCE_LOG_NOT_FOUND', message: 'Car maintenance log not found', statusCode: HttpStatus.NOT_FOUND });
  }
}

export class CarAssignmentMemberNotFoundException extends NotFoundException {
  constructor() {
    super({ error: 'CAR_ASSIGNMENT_MEMBER_NOT_FOUND', message: 'One or more organization members do not exist in this car organization', statusCode: HttpStatus.NOT_FOUND });
  }
}
