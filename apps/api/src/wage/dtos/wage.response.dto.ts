import { User } from 'src/prisma/generated/client';

export class WageResponse {
  id!: string;
  code!: string | null;
  description!: string;
  startDate!: Date;
  endDate!: Date;
  status!: string;
  note!: string | null;
  externalOrganizationName!: string | null;
  externalCustomerName!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  createdBy!: User | null;
}
