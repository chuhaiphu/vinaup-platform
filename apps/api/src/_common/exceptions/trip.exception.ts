import { ConflictException, HttpStatus, NotFoundException } from '@nestjs/common';

export class TripNotFoundException extends NotFoundException {
  constructor() {
    super({ error: 'TRIP_NOT_FOUND', message: 'Trip not found', statusCode: HttpStatus.NOT_FOUND });
  }
}

export class TripAssignmentNotFoundException extends NotFoundException {
  constructor() {
    super({ error: 'TRIP_ASSIGNMENT_NOT_FOUND', message: 'Trip assignment not found', statusCode: HttpStatus.NOT_FOUND });
  }
}

export class TripAssignmentCarNotFoundException extends NotFoundException {
  constructor() {
    super({ error: 'TRIP_ASSIGNMENT_CAR_NOT_FOUND', message: "The car does not exist in this trip's organization", statusCode: HttpStatus.NOT_FOUND });
  }
}

export class TripAssignmentMemberNotFoundException extends NotFoundException {
  constructor() {
    super({ error: 'TRIP_ASSIGNMENT_MEMBER_NOT_FOUND', message: "One or more organization members do not exist in this trip's organization", statusCode: HttpStatus.NOT_FOUND });
  }
}

export class TripAssignmentCarAlreadyInTripException extends ConflictException {
  constructor() {
    super({ error: 'TRIP_ASSIGNMENT_CAR_ALREADY_IN_TRIP', message: 'This car already has an assignment in this trip', statusCode: HttpStatus.CONFLICT });
  }
}
