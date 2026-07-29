import { wireData } from 'fetchwire';

import { InvoiceFilterParam } from '@/interfaces/_query-param-interfaces';
import {
  CreateInvoiceRequest,
  InvoiceResponse,
  UpdateInvoiceRequest,
} from '@/interfaces/invoice-interfaces';
import { generateFilterQueryString } from '@/utils/generator/string-generator/generate-filter-query-string';

export async function createInvoice(data: CreateInvoiceRequest) {
  return wireData<InvoiceResponse>(`/invoice`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateInvoice(id: string, data: UpdateInvoiceRequest) {
  return wireData<InvoiceResponse>(`/invoice/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getInvoiceById(id: string) {
  return wireData<InvoiceResponse>(`/invoice/${id}`, {
    method: 'GET',
  });
}

export async function getInvoicesByOrganizationId(
  organizationId: string,
  filter?: InvoiceFilterParam,
) {
  const filterQueryString = generateFilterQueryString(filter, {
    type: filter?.type,
    status: filter?.status,
  });
  return wireData<InvoiceResponse[]>(
    `/invoice/organization/${organizationId}${filterQueryString}`,
    {
      method: 'GET',
    },
  );
}

export async function deleteInvoice(id: string) {
  return wireData<void>(`/invoice/${id}`, {
    method: 'DELETE',
  });
}
