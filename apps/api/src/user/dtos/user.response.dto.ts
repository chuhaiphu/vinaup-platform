import type { User } from 'src/prisma/generated/client';

// Full-row response (no projection → no query-args const); the organization
// counts are computed server-side, so they extend the derived model type.
export type UserResponse = User & {
  organizationOwnedCount?: number;
  organizationLinkedCount?: number;
};
