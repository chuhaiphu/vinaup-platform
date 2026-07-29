import { wireData } from 'fetchwire';

import { TourFilterParam } from '@/interfaces/_query-param-interfaces';
import { CreateTourRequest, TourResponse, UpdateTourRequest } from '@/interfaces/tour-interfaces';
import { generateFilterQueryString } from '@/utils/generator/string-generator/generate-filter-query-string';

export async function createTour(data: CreateTourRequest) {
  return wireData<TourResponse>('/tour', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getToursByOrganizationId(organizationId: string, filter?: TourFilterParam) {
  const filterQueryString = generateFilterQueryString(filter, {
    status: filter?.status,
  });
  return wireData<TourResponse[]>(`/tour/organization/${organizationId}${filterQueryString}`, {
    method: 'GET',
  });
}

export async function getTourById(id: string) {
  return wireData<TourResponse>(`/tour/${id}`, {
    method: 'GET',
  });
}

export async function updateTour(id: string, data: UpdateTourRequest) {
  return wireData<TourResponse>(`/tour/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteTour(id: string) {
  return wireData<void>(`/tour/${id}`, {
    method: 'DELETE',
  });
}

export async function importReceiptPaymentFromTourCalculationToTourImplementation(tourId: string) {
  return wireData<null>(`/tour/${tourId}/import-receipt-payments`, {
    method: 'POST',
  });
}
