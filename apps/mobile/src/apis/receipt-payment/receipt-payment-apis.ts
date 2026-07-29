import { wireData } from 'fetchwire';

import { ReceiptPaymentFilterParam } from '@/interfaces/_query-param-interfaces';
import {
  CreateReceiptPaymentRequest,
  ReceiptPaymentResponse,
  UpdateReceiptPaymentRequest,
} from '@/interfaces/receipt-payment-interfaces';
import { generateFilterQueryString } from '@/utils/generator/string-generator/generate-filter-query-string';

export async function createReceiptPayment(data: CreateReceiptPaymentRequest) {
  return wireData<ReceiptPaymentResponse>('/receipt-payment', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getReceiptPaymentsByCurrentUser(filter?: ReceiptPaymentFilterParam) {
  const filterQueryString = generateFilterQueryString(filter, { type: filter?.type });
  return wireData<ReceiptPaymentResponse[]>(`/receipt-payment${filterQueryString}`, {
    method: 'GET',
  });
}

export async function updateReceiptPayment(id: string, data: UpdateReceiptPaymentRequest) {
  return wireData<ReceiptPaymentResponse>(`/receipt-payment/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteReceiptPayment(id: string) {
  return wireData<void>(`/receipt-payment/${id}`, {
    method: 'DELETE',
  });
}

export async function getReceiptPaymentById(id: string) {
  return wireData<ReceiptPaymentResponse>(`/receipt-payment/${id}`, {
    method: 'GET',
  });
}

export async function getReceiptPaymentsByProjectIds(projectIds: string[]) {
  return wireData<ReceiptPaymentResponse[]>('/receipt-payment/projects', {
    method: 'POST',
    body: JSON.stringify({ projectIds }),
  });
}

export async function getReceiptPaymentsByProjectId(projectId: string) {
  return wireData<ReceiptPaymentResponse[]>(`/receipt-payment/project/${projectId}`, {
    method: 'GET',
  });
}

export async function getReceiptPaymentsByWageId(wageId: string) {
  return wireData<ReceiptPaymentResponse[]>(`/receipt-payment/wage/${wageId}`, {
    method: 'GET',
  });
}

export async function getReceiptPaymentsByWageIds(wageIds: string[]) {
  return wireData<ReceiptPaymentResponse[]>('/receipt-payment/wages', {
    method: 'POST',
    body: JSON.stringify({ wageIds }),
  });
}

export async function getReceiptPaymentsByInvoiceId(invoiceId: string) {
  return wireData<ReceiptPaymentResponse[]>(`/receipt-payment/invoice/${invoiceId}`, {
    method: 'GET',
  });
}

export async function getReceiptPaymentsByInvoiceIds(invoiceIds: string[]) {
  return wireData<ReceiptPaymentResponse[]>('/receipt-payment/invoices', {
    method: 'POST',
    body: JSON.stringify({ invoiceIds }),
  });
}

export async function getReceiptPaymentsByTourCalculationId(tourCalculationId: string) {
  return wireData<ReceiptPaymentResponse[]>(
    `/receipt-payment/tour-calculation/${tourCalculationId}`,
    {
      method: 'GET',
    },
  );
}

export async function getReceiptPaymentsByTourImplementationId(tourImplementationId: string) {
  return wireData<ReceiptPaymentResponse[]>(
    `/receipt-payment/tour-implementation/${tourImplementationId}`,
    {
      method: 'GET',
    },
  );
}

export async function getReceiptPaymentsByTourSettlementId(tourSettlementId: string) {
  return wireData<ReceiptPaymentResponse[]>(
    `/receipt-payment/tour-settlement/${tourSettlementId}`,
    {
      method: 'GET',
    },
  );
}

export async function getReceiptPaymentsByBookingId(bookingId: string) {
  return wireData<ReceiptPaymentResponse[]>(`/receipt-payment/booking/${bookingId}`, {
    method: 'GET',
  });
}

export async function getReceiptPaymentsByTripId(tripId: string) {
  return wireData<ReceiptPaymentResponse[]>(`/receipt-payment/trip/${tripId}`, {
    method: 'GET',
  });
}

export async function getReceiptPaymentsByCarMaintenanceLogId(carMaintenanceLogId: string) {
  return wireData<ReceiptPaymentResponse[]>(
    `/receipt-payment/car-maintenance-log/${carMaintenanceLogId}`,
    {
      method: 'GET',
    },
  );
}

export async function getReceiptPaymentsByOrganizationId(
  organizationId: string,
  filter?: ReceiptPaymentFilterParam,
) {
  const filterQueryString = generateFilterQueryString(filter, { type: filter?.type });
  return wireData<ReceiptPaymentResponse[]>(
    `/receipt-payment/organization/${organizationId}${filterQueryString}`,
    {
      method: 'GET',
    },
  );
}
