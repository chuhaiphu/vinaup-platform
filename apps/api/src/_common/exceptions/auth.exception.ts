// auth.exceptions.ts
import { HttpException, HttpStatus } from '@nestjs/common';

export class AuthExistedException extends HttpException {
  constructor(message: string) {
    super(
      { error: 'AUTH_ACCOUNT_EXISTED', message, statusCode: HttpStatus.CONFLICT },
      HttpStatus.CONFLICT,
    );
  }
}

export class TokenInvalidException extends HttpException {
  constructor(message: string) {
    super(
      { error: 'TOKEN_INVALID', message, statusCode: HttpStatus.UNAUTHORIZED },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class InvalidCredentialsException extends HttpException {
  constructor() {
    super(
      { error: 'AUTH_INVALID_CREDENTIALS', message: 'Invalid credentials', statusCode: HttpStatus.UNAUTHORIZED },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class AuthProviderNotFoundException extends HttpException {
  constructor() {
    super(
      { error: 'AUTH_PROVIDER_NOT_FOUND', message: 'Authentication provider not found', statusCode: HttpStatus.UNAUTHORIZED },
      HttpStatus.UNAUTHORIZED,
    );
  }
}