import { wireApi } from 'fetchwire';

import {
  AuthResponse,
  CreateUserRequest,
  LocalSignInRequest,
  RefreshTokenResponse,
} from '@/interfaces/auth-interfaces';
import { UserResponse } from '@/interfaces/user-interfaces';

export async function login(data: LocalSignInRequest) {
  return wireApi<AuthResponse>('/auth/local', {
    method: 'POST',
    body: JSON.stringify(data),
    skipToken: true,
  });
}

export async function register(payload: CreateUserRequest) {
  return wireApi<UserResponse>('/user/register', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipToken: true,
  });
}

export async function refreshAccessToken(refreshToken: string) {
  return wireApi<RefreshTokenResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
    skipToken: true,
  });
}

export async function logout(refreshToken: string) {
  return wireApi<void>('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
    skipToken: true,
  });
}
