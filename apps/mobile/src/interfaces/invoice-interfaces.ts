import { InvoiceStatus, InvoiceType } from '@/constants/invoice-constants';

import { OrganizationCustomerResponse } from './organization-customer-interfaces';
import { OrganizationResponse } from './organization-interfaces';
import { UserResponse } from './user-interfaces';

export type {
  CreateInvoiceRequestInterface as CreateInvoiceRequest,
  UpdateInvoiceRequestInterface as UpdateInvoiceRequest,
} from '@vinaup-platform/validation';

export interface InvoiceResponse {
  id: string;
  type: InvoiceType;
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
