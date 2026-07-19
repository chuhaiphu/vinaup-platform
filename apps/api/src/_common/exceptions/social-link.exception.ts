import { BadRequestException, HttpStatus, NotFoundException } from '@nestjs/common';

export class SocialLinkNotFoundException extends NotFoundException {
  constructor() {
    super({ error: 'SOCIAL_LINK_NOT_FOUND', message: 'Social link not found', statusCode: HttpStatus.NOT_FOUND });
  }
}

export class SocialLinkOwnerRequiredException extends BadRequestException {
  constructor() {
    super({ error: 'SOCIAL_LINK_OWNER_REQUIRED', message: 'Social link must belong to at least a user or an organization', statusCode: HttpStatus.BAD_REQUEST });
  }
}
