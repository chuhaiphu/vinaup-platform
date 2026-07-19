import {
  ConflictException,
  ForbiddenException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';

export class OrganizationNotFoundException extends NotFoundException {
  constructor() {
    super({ error: 'ORGANIZATION_NOT_FOUND', message: 'Organization not found', statusCode: HttpStatus.NOT_FOUND });
  }
}

export class OrganizationMemberNotFoundException extends NotFoundException {
  constructor() {
    super({ error: 'ORGANIZATION_MEMBER_NOT_FOUND', message: 'Organization member not found', statusCode: HttpStatus.NOT_FOUND });
  }
}

export class OrganizationCustomerNotFoundException extends NotFoundException {
  constructor() {
    super({ error: 'ORGANIZATION_CUSTOMER_NOT_FOUND', message: 'Organization customer not found', statusCode: HttpStatus.NOT_FOUND });
  }
}

export class OrganizationNotMemberException extends ForbiddenException {
  constructor() {
    super({ error: 'ORGANIZATION_NOT_MEMBER', message: 'You do not belong to this organization', statusCode: HttpStatus.FORBIDDEN });
  }
}

export class OrganizationMemberLockedException extends ForbiddenException {
  constructor() {
    super({ error: 'ORGANIZATION_MEMBER_LOCKED', message: 'You are locked in this organization', statusCode: HttpStatus.FORBIDDEN });
  }
}

export class OrganizationPermissionDeniedException extends ForbiddenException {
  constructor() {
    super({ error: 'ORGANIZATION_PERMISSION_DENIED', message: 'You do not have permission to modify this resource', statusCode: HttpStatus.FORBIDDEN });
  }
}

export class OrganizationMemberDeleteForbiddenException extends ForbiddenException {
  constructor() {
    super({ error: 'ORGANIZATION_MEMBER_DELETE_FORBIDDEN', message: 'You are not allowed to delete this organization member', statusCode: HttpStatus.FORBIDDEN });
  }
}

export class OrganizationMemberAlreadyLinkedException extends ConflictException {
  constructor() {
    super({ error: 'ORGANIZATION_MEMBER_ALREADY_LINKED', message: 'This user is already linked to an organization member in this organization', statusCode: HttpStatus.CONFLICT });
  }
}
