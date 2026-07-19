import { InvoiceStatus } from '@/constants/invoice-constants';

import { InvoiceTypeResponse } from './invoice-type-interfaces';
import { OrganizationCustomerResponse } from './organization-customer-interfaces';
import { OrganizationResponse } from './organization-interfaces';
import { UserResponse } from './user-interfaces';

export interface InvoiceResponse {
  id: string;
  invoiceTypeId: string;
  invoiceType: InvoiceTypeResponse;
  code: string | null;
  description: string;
  startDate: string;
  endDate: string;
  discountAmount: number;
  vatRate: number;
  surchargeAmount: number;
  status: InvoiceStatus;
  note: string | null;
  createdAt: string;
  createdByUserId: string | null;
  createdBy: UserResponse | null;
  externalOrganizationName: string | null;
  externalCustomerName: string | null;
  organizationId: string | null;
  organization: OrganizationResponse | null;
  organizationCustomerId: string | null;
  organizationCustomer: OrganizationCustomerResponse | null;
}

export interface CreateInvoiceRequest {
  code?: string | null;
  invoiceTypeId: string;
  description: string;
  endDate: string;
  startDate: string;
  note?: string | null;
  organizationId?: string | null;
  organizationCustomerId?: string | null;
  externalOrganizationName?: string | null;
  externalCustomerName?: string | null;
}

export type UpdateInvoiceRequest = Partial<CreateInvoiceRequest> & {
  status?: InvoiceStatus;
  discountAmount?: number;
  vatRate?: number;
  surchargeAmount?: number;
};
