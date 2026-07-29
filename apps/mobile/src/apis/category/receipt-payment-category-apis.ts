import { wireData } from 'fetchwire';

import {
  CreateReceiptPaymentCategoryRequest,
  ReceiptPaymentCategoryResponse,
  UpdateReceiptPaymentCategoryRequest,
} from '@/interfaces/receipt-payment-interfaces';

export async function createReceiptPaymentCategory(data: CreateReceiptPaymentCategoryRequest) {
  return wireData<ReceiptPaymentCategoryResponse>('/receipt-payment-category', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getReceiptPaymentCategoriesOfCurrentUser() {
  return wireData<ReceiptPaymentCategoryResponse[]>('/receipt-payment-category', {
    method: 'GET',
  });
}

export async function getReceiptPaymentCategoriesByOrganizationId(organizationId: string) {
  return wireData<ReceiptPaymentCategoryResponse[]>(
    `/receipt-payment-category/organization/${organizationId}`,
    { method: 'GET' },
  );
}

export async function getReceiptPaymentCategoryById(id: string) {
  return wireData<ReceiptPaymentCategoryResponse>(`/receipt-payment-category/${id}`, {
    method: 'GET',
  });
}

export async function updateReceiptPaymentCategory(
  id: string,
  data: UpdateReceiptPaymentCategoryRequest,
) {
  return wireData<ReceiptPaymentCategoryResponse>(`/receipt-payment-category/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteReceiptPaymentCategory(id: string) {
  return wireData<void>(`/receipt-payment-category/${id}`, {
    method: 'DELETE',
  });
}
