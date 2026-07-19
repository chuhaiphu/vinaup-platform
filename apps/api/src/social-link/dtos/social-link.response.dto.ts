import { Organization, User } from 'src/prisma/generated/client';

export class SocialLinkResponse {
  id!: string;
  description!: string | null;
  platform!: string;
  url!: string;
  user!: User | null;
  organization!: Organization | null;
  createdBy!: User | null;
}
