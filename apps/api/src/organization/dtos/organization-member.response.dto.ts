import { Organization, OrganizationRole, User } from 'src/prisma/generated/client';

export class OrganizationMemberResponse {
  id!: string;
  type!: string;
  organizationId!: string;
  name!: string;
  phone!: string;
  email!: string | null;
  address!: string | null;
  avatarUrl!: string | null;
  status!: string;
  joinedAt!: Date;
  organizationRoleId!: string;
  createdBy!: User | null;
  user!: User | null;
  organization!: Organization;
  organizationRole!: OrganizationRole;
}
