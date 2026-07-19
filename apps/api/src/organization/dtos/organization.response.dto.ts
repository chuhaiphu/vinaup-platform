import { OrganizationIndustry, User } from 'src/prisma/generated/client';

export class OrganizationResponse {
  id!: string;
  name!: string;
  email!: string | null;
  phone!: string;
  address!: string | null;
  website!: string | null;
  avatarUrl!: string | null;
  province!: string;
  createdAt!: Date;
  updatedAt!: Date;
  createdBy!: User | null;
  organizationIndustry!: OrganizationIndustry;
  memberCount?: number;
  memberLinkedCount?: number;
}
