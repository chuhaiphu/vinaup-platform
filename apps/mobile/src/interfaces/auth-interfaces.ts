import { OrganizationResponse } from './organization-interfaces';
import { UserResponse } from './user-interfaces';

export type {
  CreateUserRequestInterface as CreateUserRequest,
  LocalSignInRequestInterface as LocalSignInRequest,
} from '@vinaup-platform/validation';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
  organizations?: OrganizationResponse[];
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface AccessTokenPayload {
  sub: string;
  iat: number;
  exp: number;
}
