// app.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let responseBody: string | object;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      responseBody = exception.getResponse();
    }
    else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      responseBody = {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
        statusCode: status,
      };

      this.logger.error(
        String(exception),
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    this.logger.warn(
      `${status} ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : undefined,
      exception instanceof HttpException ? exception.getResponse() : undefined,
      exception instanceof HttpException ? exception.getStatus() : undefined,
    );

    response.status(status).json(responseBody);
  }
}