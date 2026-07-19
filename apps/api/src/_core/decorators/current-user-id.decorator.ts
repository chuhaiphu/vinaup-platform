import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AuthenticatedRequest } from 'src/_common/interfaces/interface';

// ─── @CurrentUserId — read the authenticated caller's id off the request ─
export const CurrentUserId = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  return request.user.userId;
});
