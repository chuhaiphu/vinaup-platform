import { Organization, OrganizationCustomer, ProjectCategory, User } from 'src/prisma/generated/client';

export class ProjectResponse {
  id!: string;
  type?: string | null;
  code!: string | null;
  description!: string;
  startDate!: Date;
  endDate!: Date;
  status!: string;
  note!: string | null;
  createdBy!: User | null;
  externalOrganizationName!: string | null;
  externalCustomerName!: string | null;
  organization!: Organization | null;
  organizationCustomer!: OrganizationCustomer | null;
  category!: ProjectCategory | null;
}
