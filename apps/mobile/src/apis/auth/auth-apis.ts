import { wireData } from 'fetchwire';

import {
  AuthResponse,
  CreateUserRequest,
  LocalSignInRequest,
  RefreshTokenResponse,
} from '@/interfaces/auth-interfaces';
import { UserResponse } from '@/interfaces/user-interfaces';

export async function login(data: LocalSignInRequest) {
  return wireData<AuthResponse>('/auth/local', {
    method: 'POST',
    body: JSON.stringify(data),
    skipToken: true,
  });
}

export async function register(payload: CreateUserRequest) {
  return wireData<UserResponse>('/user/register', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipToken: true,
  });
}

export async function refreshAccessToken(refreshToken: string) {
  return wireData<RefreshTokenResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
    skipToken: true,
  });
}

export async function logout(refreshToken: string) {
  return wireData<void>('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
    skipToken: true,
  });
}
