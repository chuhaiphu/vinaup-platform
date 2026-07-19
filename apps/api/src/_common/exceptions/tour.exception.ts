import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';

export class TourNotFoundException extends NotFoundException {
  constructor() {
    super({ error: 'TOUR_NOT_FOUND', message: 'Tour not found', statusCode: HttpStatus.NOT_FOUND });
  }
}

export class TourCalculationNotFoundException extends NotFoundException {
  constructor() {
    super({ error: 'TOUR_CALCULATION_NOT_FOUND', message: 'Tour calculation not found', statusCode: HttpStatus.NOT_FOUND });
  }
}

export class TourCalculationCancelLogNotFoundException extends NotFoundException {
  constructor() {
    super({ error: 'TOUR_CALCULATION_CANCEL_LOG_NOT_FOUND', message: 'Tour calculation cancel log not found', statusCode: HttpStatus.NOT_FOUND });
  }
}

export class TourImplementationNotFoundException extends NotFoundException {
  constructor() {
    super({ error: 'TOUR_IMPLEMENTATION_NOT_FOUND', message: 'Tour implementation not found', statusCode: HttpStatus.NOT_FOUND });
  }
}

export class TourImplementationAssignmentNotFoundException extends NotFoundException {
  constructor() {
    super({ error: 'TOUR_IMPLEMENTATION_ASSIGNMENT_NOT_FOUND', message: 'Tour implementation assignment not found', statusCode: HttpStatus.NOT_FOUND });
  }
}

export class TourImplementationAssignedUserNotFoundException extends NotFoundException {
  constructor() {
    super({ error: 'TOUR_IMPLEMENTATION_ASSIGNED_USER_NOT_FOUND', message: 'Assigned user not found', statusCode: HttpStatus.NOT_FOUND });
  }
}

export class TourImplementationNotAssignedException extends ForbiddenException {
  constructor() {
    super({ error: 'TOUR_IMPLEMENTATION_NOT_ASSIGNED', message: 'You are not an assigned member of this tour implementation', statusCode: HttpStatus.FORBIDDEN });
  }
}

export class TourImplementationCannotRemoveSelfException extends ForbiddenException {
  constructor() {
    super({ error: 'TOUR_IMPLEMENTATION_CANNOT_REMOVE_SELF', message: 'You cannot remove yourself from assigned users', statusCode: HttpStatus.FORBIDDEN });
  }
}

export class TourImplementationCannotRemoveCreatorException extends BadRequestException {
  constructor() {
    super({ error: 'TOUR_IMPLEMENTATION_CANNOT_REMOVE_CREATOR', message: 'You cannot remove members with CREATOR role from assigned members', statusCode: HttpStatus.BAD_REQUEST });
  }
}

export class TourSettlementNotFoundException extends NotFoundException {
  constructor() {
    super({ error: 'TOUR_SETTLEMENT_NOT_FOUND', message: 'Tour settlement not found', statusCode: HttpStatus.NOT_FOUND });
  }
}

export class TourSettlementCancelLogNotFoundException extends NotFoundException {
  constructor() {
    super({ error: 'TOUR_SETTLEMENT_CANCEL_LOG_NOT_FOUND', message: 'Tour settlement cancel log not found', statusCode: HttpStatus.NOT_FOUND });
  }
}
