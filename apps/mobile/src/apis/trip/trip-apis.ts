import { wireApi } from 'fetchwire';

import { TripFilterParam } from '@/interfaces/_query-param-interfaces';
import { CreateTripRequest, TripResponse, UpdateTripRequest } from '@/interfaces/trip-interfaces';
import { generateFilterQueryString } from '@/utils/generator/string-generator/generate-filter-query-string';

export async function createTrip(data: CreateTripRequest) {
  return wireApi<TripResponse>('/trip', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getTripsByOrganizationId(organizationId: string, filter?: TripFilterParam) {
  const filterQueryString = generateFilterQueryString(filter, {
    status: filter?.status,
  });
  return wireApi<TripResponse[]>(`/trip/organization/${organizationId}${filterQueryString}`, {
    method: 'GET',
  });
}

export async function getTripById(id: string) {
  return wireApi<TripResponse>(`/trip/${id}`, {
    method: 'GET',
  });
}

export async function updateTrip(id: string, data: UpdateTripRequest) {
  return wireApi<TripResponse>(`/trip/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteTrip(id: string) {
  return wireApi<void>(`/trip/${id}`, {
    method: 'DELETE',
  });
}
