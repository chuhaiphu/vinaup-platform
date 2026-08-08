import { ArgumentsHost, Catch, ExceptionFilter, Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Response } from 'express';

import {
  AccessTokenInvalidException,
  RefreshTokenInvalidException,
} from 'src/_common/exceptions/auth.exception';

import authConfig from '../configs/auth.config';

@Injectable()
@Catch(AccessTokenInvalidException, RefreshTokenInvalidException)
export class AuthExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(authConfig.KEY)
    private readonly authConf: ConfigType<typeof authConfig>,
  ) {}

  catch(
    exception: AccessTokenInvalidException | RefreshTokenInvalidException,
    host: ArgumentsHost,
  ): void {
    const response = host.switchToHttp().getResponse<Response>();

    response.clearCookie(
      this.authConf.cookies.accessToken.name,
      this.authConf.cookies.accessToken.options,
    );

    if (!(exception instanceof AccessTokenInvalidException)) {
      response.clearCookie(
        this.authConf.cookies.refreshToken.name,
        this.authConf.cookies.refreshToken.options,
      );
    }

    // Write the response directly — returning here would let Nest drop the Set-Cookie header on a 4xx.
    response.status(exception.getStatus()).json(exception.getResponse());
  }
}
