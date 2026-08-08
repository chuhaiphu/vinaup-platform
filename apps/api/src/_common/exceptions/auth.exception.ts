import { HttpException, HttpStatus } from '@nestjs/common';

export class AccessTokenInvalidException extends HttpException {
  constructor(message: string) {
    super(
      { error: 'ACCESS_TOKEN_INVALID', message, statusCode: HttpStatus.UNAUTHORIZED },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class RefreshTokenInvalidException extends HttpException {
  constructor(message: string) {
    super(
      { error: 'REFRESH_TOKEN_INVALID', message, statusCode: HttpStatus.UNAUTHORIZED },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class InvalidCredentialsException extends HttpException {
  constructor() {
    super(
      {
        error: 'AUTH_CREDENTIALS_INVALID',
        message: 'Invalid credentials',
        statusCode: HttpStatus.UNAUTHORIZED,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class CurrentPasswordInvalidException extends HttpException {
  constructor() {
    super(
      {
        error: 'CURRENT_PASSWORD_INVALID',
        message: 'Current password is incorrect',
        statusCode: HttpStatus.UNAUTHORIZED,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class AccountDisabledException extends HttpException {
  constructor() {
    super(
      {
        error: 'ACCOUNT_DISABLED',
        message: 'Account is disabled',
        statusCode: HttpStatus.FORBIDDEN,
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

export class SignUpOtpInvalidException extends HttpException {
  constructor() {
    super(
      {
        error: 'SIGN_UP_OTP_INVALID',
        message: 'Sign-up code is invalid or has expired',
        statusCode: HttpStatus.BAD_REQUEST,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class SignInOtpInvalidException extends HttpException {
  constructor() {
    super(
      {
        error: 'SIGN_IN_OTP_INVALID',
        message: 'Sign-in code is invalid or has expired',
        statusCode: HttpStatus.BAD_REQUEST,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class EmailVerificationInvalidException extends HttpException {
  constructor() {
    super(
      {
        error: 'EMAIL_VERIFICATION_INVALID',
        message: 'Email verification code is invalid or has expired',
        statusCode: HttpStatus.BAD_REQUEST,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class ResetTokenInvalidException extends HttpException {
  constructor() {
    super(
      {
        error: 'RESET_TOKEN_INVALID',
        message: 'Reset token is invalid or has expired',
        statusCode: HttpStatus.BAD_REQUEST,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class PhoneAlreadyUsedException extends HttpException {
  constructor() {
    super(
      {
        error: 'PHONE_ALREADY_USED',
        message: 'Phone number is already registered',
        statusCode: HttpStatus.CONFLICT,
      },
      HttpStatus.CONFLICT,
    );
  }
}

export class EmailAlreadyUsedException extends HttpException {
  constructor() {
    super(
      {
        error: 'EMAIL_ALREADY_USED',
        message: 'Email is already used by another account',
        statusCode: HttpStatus.CONFLICT,
      },
      HttpStatus.CONFLICT,
    );
  }
}

export class EmailAlreadyLinkedException extends HttpException {
  constructor() {
    super(
      {
        error: 'EMAIL_ALREADY_LINKED',
        message: 'Account already has a linked email',
        statusCode: HttpStatus.CONFLICT,
      },
      HttpStatus.CONFLICT,
    );
  }
}
