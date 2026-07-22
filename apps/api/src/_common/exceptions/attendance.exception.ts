import {
  ConflictException,
  ForbiddenException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';

export class AttendanceRecordNotFoundException extends NotFoundException {
  constructor() {
    super({ error: 'ATTENDANCE_RECORD_NOT_FOUND', message: 'Attendance record not found', statusCode: HttpStatus.NOT_FOUND });
  }
}

export class AttendanceRecordNotOwnerException extends ForbiddenException {
  constructor() {
    super({ error: 'ATTENDANCE_RECORD_NOT_OWNER', message: 'You may only modify your own attendance record', statusCode: HttpStatus.FORBIDDEN });
  }
}

export class AttendanceHasOpenRecordException extends ConflictException {
  constructor() {
    super({ error: 'ATTENDANCE_HAS_OPEN_RECORD', message: 'You already have an open attendance record; check out first', statusCode: HttpStatus.CONFLICT });
  }
}

export class AttendanceNoOpenRecordException extends ConflictException {
  constructor() {
    super({ error: 'ATTENDANCE_NO_OPEN_RECORD', message: 'No open attendance record to check out', statusCode: HttpStatus.CONFLICT });
  }
}

export class AttendanceDayLockedException extends ConflictException {
  constructor() {
    super({ error: 'ATTENDANCE_DAY_LOCKED', message: 'This workday has been finalized and is locked', statusCode: HttpStatus.CONFLICT });
  }
}

export class AttendanceConclusionNotFoundException extends NotFoundException {
  constructor() {
    super({ error: 'ATTENDANCE_CONCLUSION_NOT_FOUND', message: 'Attendance conclusion not found', statusCode: HttpStatus.NOT_FOUND });
  }
}

export class AttendanceConclusionAlreadyExistsException extends ConflictException {
  constructor() {
    super({ error: 'ATTENDANCE_CONCLUSION_ALREADY_EXISTS', message: 'A conclusion already exists for this member and workday', statusCode: HttpStatus.CONFLICT });
  }
}

export class AttendanceConclusionLockedException extends ConflictException {
  constructor() {
    super({ error: 'ATTENDANCE_CONCLUSION_LOCKED', message: 'A completed conclusion must be reopened before it can be changed', statusCode: HttpStatus.CONFLICT });
  }
}
