import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  Inject,
  Injectable,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Response } from 'express';

import { TokenInvalidException } from 'src/_common/exceptions/auth.exception';

import authConfig from '../configs/auth.config';

@Injectable()
@Catch(TokenInvalidException)
export class AuthExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(authConfig.KEY)
    private readonly authConf: ConfigType<typeof authConfig>
  ) {}
  catch(
    exception: TokenInvalidException,
    host: ArgumentsHost
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    response.clearCookie(this.authConf.cookies.accessToken.name, {
      ...this.authConf.cookies.accessToken.options,
    });
    // if return here, the header will be dropped because of status code 4xx
    // set response directly to the client to preserve the cookie
    response.status(exception.getStatus()).json(exception.getResponse());
  }
}
