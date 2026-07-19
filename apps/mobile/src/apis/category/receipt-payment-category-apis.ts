import { wireApi } from 'fetchwire';

import {
  CreateReceiptPaymentCategoryRequest,
  ReceiptPaymentCategoryResponse,
  UpdateReceiptPaymentCategoryRequest,
} from '@/interfaces/receipt-payment-interfaces';

export async function createReceiptPaymentCategory(data: CreateReceiptPaymentCategoryRequest) {
  return wireApi<ReceiptPaymentCategoryResponse>('/receipt-payment-category', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getReceiptPaymentCategoriesOfCurrentUser() {
  return wireApi<ReceiptPaymentCategoryResponse[]>('/receipt-payment-category', {
    method: 'GET',
  });
}

export async function getReceiptPaymentCategoriesByOrganizationId(organizationId: string) {
  return wireApi<ReceiptPaymentCategoryResponse[]>(
    `/receipt-payment-category/organization/${organizationId}`,
    { method: 'GET' },
  );
}

export async function getReceiptPaymentCategoryById(id: string) {
  return wireApi<ReceiptPaymentCategoryResponse>(`/receipt-payment-category/${id}`, {
    method: 'GET',
  });
}

export async function updateReceiptPaymentCategory(
  id: string,
  data: UpdateReceiptPaymentCategoryRequest,
) {
  return wireApi<ReceiptPaymentCategoryResponse>(`/receipt-payment-category/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteReceiptPaymentCategory(id: string) {
  return wireApi<void>(`/receipt-payment-category/${id}`, {
    method: 'DELETE',
  });
}
