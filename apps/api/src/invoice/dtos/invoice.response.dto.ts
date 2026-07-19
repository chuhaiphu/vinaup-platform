import { InvoiceType, Organization, OrganizationCustomer, User } from 'src/prisma/generated/client';

export class InvoiceResponse {
  id!: string;
  invoiceType!: InvoiceType;
  code!: string | null;
  description!: string;
  startDate!: Date;
  endDate!: Date;
  status!: string;
  note!: string | null;
  discountAmount!: number;
  vatRate!: number;
  surchargeAmount!: number;
  createdAt!: Date;
  createdBy!: User | null;
  externalOrganizationName!: string | null;
  externalCustomerName!: string | null;
  organization!: Organization | null;
  organizationCustomer!: OrganizationCustomer | null;
}
