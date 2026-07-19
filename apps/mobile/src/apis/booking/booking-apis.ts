import { wireApi } from 'fetchwire';

import { BookingFilterParam } from '@/interfaces/_query-param-interfaces';
import {
  CreateBookingRequest,
  BookingResponse,
  UpdateBookingRequest,
  BookingWithMeta,
} from '@/interfaces/booking-interfaces';
import { generateFilterQueryString } from '@/utils/generator/string-generator/generate-filter-query-string';

export async function createBooking(data: CreateBookingRequest) {
  return wireApi<BookingResponse>('/booking', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getBookingsByOrganizationId(
  organizationId: string,
  filter?: BookingFilterParam,
) {
  const filterQueryString = generateFilterQueryString(filter, {
    status: filter?.status,
  });
  return wireApi<BookingWithMeta[]>(`/booking/organization/${organizationId}${filterQueryString}`, {
    method: 'GET',
  });
}

export async function getBookingsByOrganizationCustomerOrganizationId(
  organizationId: string,
  filter?: BookingFilterParam,
) {
  const filterQueryString = generateFilterQueryString(filter, {
    status: filter?.status,
  });
  return wireApi<BookingWithMeta[]>(
    `/booking/by-organization-customer/organization/${organizationId}${filterQueryString}`,
    { method: 'GET' },
  );
}

export async function getBookingById(id: string) {
  return wireApi<BookingWithMeta>(`/booking/${id}`, {
    method: 'GET',
  });
}

export async function updateBooking(id: string, data: UpdateBookingRequest) {
  return wireApi<BookingResponse>(`/booking/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteBooking(id: string) {
  return wireApi<void>(`/booking/${id}`, {
    method: 'DELETE',
  });
}

export async function getBookingsByTourImplementationId(
  tourImplementationId: string,
  filter?: BookingFilterParam,
) {
  const filterQueryString = generateFilterQueryString(filter, {
    status: filter?.status,
  });
  return wireApi<BookingResponse[]>(
    `/booking/tour-implementation/${tourImplementationId}${filterQueryString}`,
    { method: 'GET' },
  );
}
