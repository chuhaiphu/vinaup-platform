import { wireApi } from 'fetchwire';

import { InvoiceFilterParam } from '@/interfaces/_query-param-interfaces';
import {
  CreateInvoiceRequest,
  InvoiceResponse,
  UpdateInvoiceRequest,
} from '@/interfaces/invoice-interfaces';
import { InvoiceTypeResponse } from '@/interfaces/invoice-type-interfaces';
import { generateFilterQueryString } from '@/utils/generator/string-generator/generate-filter-query-string';

export async function createInvoice(data: CreateInvoiceRequest) {
  return wireApi<InvoiceResponse>(`/invoice`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateInvoice(id: string, data: UpdateInvoiceRequest) {
  return wireApi<InvoiceResponse>(`/invoice/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getInvoiceTypes() {
  return wireApi<InvoiceTypeResponse[]>(`/invoice/types`, {
    method: 'GET',
  });
}

export async function getInvoiceById(id: string) {
  return wireApi<InvoiceResponse>(`/invoice/${id}`, {
    method: 'GET',
  });
}

export async function getInvoicesByOrganizationId(
  organizationId: string,
  filter?: InvoiceFilterParam,
) {
  const filterQueryString = generateFilterQueryString(filter, {
    invoiceTypeId: filter?.invoiceTypeId,
    status: filter?.status,
  });
  return wireApi<InvoiceResponse[]>(`/invoice/organization/${organizationId}${filterQueryString}`, {
    method: 'GET',
  });
}

export async function deleteInvoice(id: string) {
  return wireApi<void>(`/invoice/${id}`, {
    method: 'DELETE',
  });
}
