import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AccessTokenInvalidException } from 'src/_common/exceptions/auth.exception';
import { JwtValidationReturn } from 'src/_common/interfaces/interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = JwtValidationReturn>(
    error: unknown,
    user: TUser | false | null,
    info: { name: string; message: string } | undefined
  ): TUser {
    if (error instanceof Error) {
      throw error;
    }
    // info is the Error object returned from passport-jwt
    if (info) {
      if (info.name === 'TokenExpiredError' || info.name === 'JsonWebTokenError') {
        throw new AccessTokenInvalidException('Token is invalid or has expired');
      }
      else {
        throw new AccessTokenInvalidException(info.message);
      }
    }
    if (!user) {
      throw new AccessTokenInvalidException('User is no longer valid');
    }

    return user;
  }
}
