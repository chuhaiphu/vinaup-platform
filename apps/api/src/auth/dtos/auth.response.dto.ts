import { Organization, User } from 'src/prisma/generated/client';

export class AuthResponse {
  accessToken!: string;
  refreshToken!: string;
  user!: User & {
    organizationOwnedCount: number;
    organizationLinkedCount: number;
  };
  organizations?: Organization[];
}
