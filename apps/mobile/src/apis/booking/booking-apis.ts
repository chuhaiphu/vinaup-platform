import { wireData } from 'fetchwire';

import { BookingFilterParam } from '@/interfaces/_query-param-interfaces';
import {
  CreateBookingRequest,
  BookingResponse,
  UpdateBookingRequest,
  BookingWithMeta,
} from '@/interfaces/booking-interfaces';
import { generateFilterQueryString } from '@/utils/generator/string-generator/generate-filter-query-string';

export async function createBooking(data: CreateBookingRequest) {
  return wireData<BookingResponse>('/booking', {
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
  return wireData<BookingWithMeta[]>(
    `/booking/organization/${organizationId}${filterQueryString}`,
    {
      method: 'GET',
    },
  );
}

export async function getBookingsByOrganizationCustomerOrganizationId(
  organizationId: string,
  filter?: BookingFilterParam,
) {
  const filterQueryString = generateFilterQueryString(filter, {
    status: filter?.status,
  });
  return wireData<BookingWithMeta[]>(
    `/booking/by-organization-customer/organization/${organizationId}${filterQueryString}`,
    { method: 'GET' },
  );
}

export async function getBookingById(id: string) {
  return wireData<BookingWithMeta>(`/booking/${id}`, {
    method: 'GET',
  });
}

export async function updateBooking(id: string, data: UpdateBookingRequest) {
  return wireData<BookingResponse>(`/booking/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteBooking(id: string) {
  return wireData<void>(`/booking/${id}`, {
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
  return wireData<BookingResponse[]>(
    `/booking/tour-implementation/${tourImplementationId}${filterQueryString}`,
    { method: 'GET' },
  );
}
