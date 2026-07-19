import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';

import { refreshAccessToken } from '@/apis/auth/auth-apis';
import { ACCESS_TOKEN_KEY, EXPIRY_SKEW_MS, REFRESH_TOKEN_KEY } from '@/constants/app-constants';
import { AccessTokenPayload } from '@/interfaces/auth-interfaces';

class TokenManager {
  // ─── Single-flight lock ────────────────────────────────────────────────────
  // Many requests fire at once on cold-start, each would trigger its own /auth/refresh.
  // So we use one shared promise collapses them into ONE network call.
  private inflightRefresh: Promise<string | null> | null = null;

  async storeAuthTokens(tokens: { accessToken: string; refreshToken: string }): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken),
    ]);
  }

  async clearAuthTokens(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
  }

  async getStoredRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  }

  async getValidAccessToken(): Promise<string | null> {
    const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    if (!accessToken) return null;

    // ─── Step 1: Decide whether the token must be refreshed before use ───────────
    // Covers BOTH cases —
    //   • near-expiry (exp - skew ≤ now < exp): the truly "proactive" refresh,
    //   • already-expired (now ≥ exp): e.g. app reopened after a long pause.
    let needsRefresh: boolean;
    try {
      const { exp } = jwtDecode<AccessTokenPayload>(accessToken);

      // Why need EXPIRY_SKEW_MS:
      // Any request spends a network round-trip in transit between client and server.
      // An access token that is "barely alive" in client could expire when it arrives to server,
      // then server validate that access token that gap and come back as a 401.
      // By refreshing anything within EXPIRY_SKEW_MS of expiry,
      // every token we DO send has at least EXPIRY_SKEW_MS of life left,
      // which is enough to outlive a normal round-trip instead of dying in flight.
      // `exp` is a UNIX timestamp in SECONDS (JWT standard), ×1000 to compare with Date.now() in ms.
      needsRefresh = Date.now() >= exp * 1000 - EXPIRY_SKEW_MS;
    } catch {
      // Malformed / undecodable token → treat as needing refresh.
      needsRefresh = true;
    }
    if (!needsRefresh) return accessToken;

    // ─── Step 2: Perform refresh, but only ONE network call for a burst of callers ────
    // If no refresh is currently in flight, start one and remember its promise,
    // otherwise reuse the in-flight promise.
    // `.finally` releases the lock once it settles, so a later burst can refresh again.
    if (!this.inflightRefresh) {
      this.inflightRefresh = this.getNewAccessToken().finally(() => {
        this.inflightRefresh = null;
      });
    }
    return this.inflightRefresh;
  }

  private async getNewAccessToken(): Promise<string | null> {
    const refreshToken = await this.getStoredRefreshToken();
    if (!refreshToken) {
      await this.clearAuthTokens();
      return null;
    }
    const response = await refreshAccessToken(refreshToken);
    const nextAccessToken = response.data?.accessToken;
    if (!nextAccessToken) {
      await this.clearAuthTokens();
      return null;
    }

    await this.storeAuthTokens({ accessToken: nextAccessToken, refreshToken });
    return nextAccessToken;
  }
}

export const tokenManager = new TokenManager();
