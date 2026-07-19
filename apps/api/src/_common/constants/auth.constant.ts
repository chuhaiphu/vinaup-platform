// Credential provider for an Auth row. `LOCAL` = email+password; the rest are OAuth subjects.
export const AUTH_PROVIDER = {
  LOCAL: 'LOCAL',
  GOOGLE: 'GOOGLE',
} as const;

export type AuthProvider = (typeof AUTH_PROVIDER)[keyof typeof AUTH_PROVIDER];
