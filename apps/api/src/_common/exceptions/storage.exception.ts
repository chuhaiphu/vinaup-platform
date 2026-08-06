import {
  HttpStatus,
  InternalServerErrorException,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';

export class FileTooLargeException extends PayloadTooLargeException {
  constructor() {
    super({
      error: 'FILE_TOO_LARGE',
      message: 'File exceeds the maximum allowed size',
      statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
    });
  }
}

export class FileTypeInvalidException extends UnsupportedMediaTypeException {
  constructor() {
    super({
      error: 'FILE_TYPE_INVALID',
      message: 'File type is not allowed',
      statusCode: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
    });
  }
}

export class UploadFailedException extends InternalServerErrorException {
  constructor() {
    super({
      error: 'UPLOAD_FAILED',
      message: 'Failed to store the uploaded file',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  }
}

export class StorageDriverNotIntegratedException extends InternalServerErrorException {
  constructor() {
    super({
      error: 'STORAGE_DRIVER_NOT_INTEGRATED',
      message: 'The selected storage driver has no backend behind it',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  }
}
