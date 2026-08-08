import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const OptionalBody = createParamDecorator((_data: unknown, ctx: ExecutionContext): unknown => {
  const request = ctx.switchToHttp().getRequest<Request>();
  return request.body ?? {};
});
