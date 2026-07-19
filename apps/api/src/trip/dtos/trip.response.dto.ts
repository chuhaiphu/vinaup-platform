import { Organization, OrganizationCustomer, User } from 'src/prisma/generated/client';

import { TripAssignmentResponse } from './trip-assignment.response.dto';

export class TripResponse {
  id!: string;
  code!: string | null;
  description!: string;
  content!: string | null;
  startDate!: Date;
  endDate!: Date;
  status!: string;
  rentalPrice!: number;
  taxRate!: number;
  commissionRate!: number;
  note!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  createdBy!: User | null;
  organization!: Organization;
  organizationCustomer!: OrganizationCustomer | null;
  externalOrganizationName!: string | null;
  externalCustomerName!: string | null;
  // Optional: only the list endpoint includes assignments (drivers + cars) so cards can
  // summarise them; detail/create/update omit it, hence optional to keep those callers valid.
  tripAssignments?: TripAssignmentResponse[];
}
