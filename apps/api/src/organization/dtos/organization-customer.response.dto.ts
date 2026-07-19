import { Organization, User } from 'src/prisma/generated/client';

export class OrganizationCustomerResponse {
  id!: string;
  organizationId!: string;
  clientUserId!: string | null;
  clientOrganizationId!: string | null;
  name!: string;
  phone!: string;
  email!: string | null;
  status!: string;
  isSystemDefault!: boolean;
  joinedAt!: Date;
  createdBy!: User | null;
  clientUser!: User | null;
  clientOrganization!: Organization | null;
  organization!: Organization;
}
