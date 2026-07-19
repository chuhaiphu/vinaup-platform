import { Request } from 'express';

export interface HttpResponse<T> {
  message: string;
  statusCode: number;
  data?: T;
}

export interface BaseMeta {
  canEdit: boolean;
}

export interface AuthenticatedRequest extends Request {
  user: JwtValidationReturn;
}

export interface JwtValidationReturn {
  userId: string;
  roles?: string[];
}

export interface JwtPayload {
  sub: string;
}
