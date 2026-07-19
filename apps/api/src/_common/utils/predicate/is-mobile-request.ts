import type { Request } from 'express';

export const isMobileRequest = (request: Request): boolean =>
  request.get('x-request-platform') === 'mobile';
