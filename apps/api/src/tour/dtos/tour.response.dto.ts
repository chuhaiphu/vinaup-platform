import { Organization, OrganizationCustomer, TourCalculation, TourImplementation, TourSettlement, User } from 'src/prisma/generated/client';

export interface TourResponse {
  id: string;
  code: string | null;
  description: string;
  startDate: Date;
  endDate: Date;
  status: string;
  note: string | null;
  createdAt: Date;
  createdBy: User | null;
  externalOrganizationName: string | null;
  externalCustomerName: string | null;
  organization: Organization | null;
  organizationCustomer: OrganizationCustomer | null;
  tourCalculation: TourCalculation | null;
  tourImplementation: TourImplementation | null;
  tourSettlement: TourSettlement | null;
}
