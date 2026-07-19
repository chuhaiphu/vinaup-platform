import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { TokenInvalidException } from 'src/_common/exceptions/auth.exception';
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
        throw new TokenInvalidException('Token is invalid or has expired');
      }
      else {
        throw new TokenInvalidException(info.message);
      }
    }
    if (!user) {
      throw new TokenInvalidException('User is no longer valid');
    }

    return user;
  }
}
