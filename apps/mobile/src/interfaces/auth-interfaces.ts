import { OrganizationResponse } from './organization-interfaces';
import { UserResponse } from './user-interfaces';

export interface LocalSignInRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
  organizations?: OrganizationResponse[];
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  phone?: string | null;
  province?: string | null;
  avatarUrl?: string | null;
}

export interface AccessTokenPayload {
  sub: string;
  iat: number;
  exp: number;
}
