import {
  BadRequestException,
  HttpStatus,
  NotFoundException,
  PayloadTooLargeException,
} from '@nestjs/common';

export class UploadFileRequiredException extends BadRequestException {
  constructor() {
    super({ error: 'UPLOAD_FILE_REQUIRED', message: 'File is required', statusCode: HttpStatus.BAD_REQUEST });
  }
}

export class UploadInvalidFileTypeException extends BadRequestException {
  constructor() {
    super({ error: 'UPLOAD_INVALID_FILE_TYPE', message: 'Invalid file type', statusCode: HttpStatus.BAD_REQUEST });
  }
}

export class UploadFileTooLargeException extends PayloadTooLargeException {
  constructor() {
    super({ error: 'UPLOAD_FILE_TOO_LARGE', message: 'File too large', statusCode: HttpStatus.PAYLOAD_TOO_LARGE });
  }
}

export class UploadPathRequiredException extends BadRequestException {
  constructor() {
    super({ error: 'UPLOAD_PATH_REQUIRED', message: 'Path is required', statusCode: HttpStatus.BAD_REQUEST });
  }
}

export class UploadFileNotFoundException extends NotFoundException {
  constructor() {
    super({ error: 'UPLOAD_FILE_NOT_FOUND', message: 'File not found', statusCode: HttpStatus.NOT_FOUND });
  }
}
