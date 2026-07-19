import type { Organization, User } from 'src/prisma/generated/client';

// Computed token payload — assembled server-side, never queried as one row,
// so it is a hand-written interface (no query-args const).
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User & {
    organizationOwnedCount: number;
    organizationLinkedCount: number;
  };
  organizations?: Organization[];
}
