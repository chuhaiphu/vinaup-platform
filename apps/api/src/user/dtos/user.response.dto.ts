import { Prisma } from 'src/prisma/generated/client';
import type { StorageService } from 'src/storage/storage.service';

// The projection a user is EMBEDDED with — `createdBy`, `targetUser`, `member.user`, …
export const embeddedUserQueryArgs = {
  select: {
    id: true,
    email: true,
    name: true,
    phone: true,
    avatarKey: true,
    createdAt: true,
    updatedAt: true,
  },
} satisfies Prisma.UserDefaultArgs;

// DB holds `avatarKey`; the wire exposes `avatarUrl` (StorageService.getPublicUrl).
type EmbeddedUserPayload = Prisma.UserGetPayload<typeof embeddedUserQueryArgs>;
export type EmbeddedUserResponse = Omit<EmbeddedUserPayload, 'avatarKey'> & {
  avatarUrl: string | null;
};

// The organization counts are computed server-side, so they extend the derived type.
export type UserResponse = EmbeddedUserResponse & {
  organizationOwnedCount?: number;
  organizationLinkedCount?: number;
};

export const toEmbeddedUserResponse = (
  user: EmbeddedUserPayload,
  storageService: StorageService,
): EmbeddedUserResponse => {
  const { avatarKey, ...userRest } = user;
  return {
    ...userRest,
    avatarUrl: avatarKey ? storageService.getPublicUrl(avatarKey) : null,
  };
};
