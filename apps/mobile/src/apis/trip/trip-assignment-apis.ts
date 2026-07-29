import { wireData } from 'fetchwire';

import {
  CreateTripAssignmentRequest,
  TripAssignmentWithMeta,
  UpdateTripAssignmentRequest,
} from '@/interfaces/trip-interfaces';

export async function getTripAssignmentsByTripId(tripId: string) {
  return wireData<TripAssignmentWithMeta[]>(`/trip-assignment/trip/${tripId}`, {
    method: 'GET',
  });
}

export async function createTripAssignment(data: CreateTripAssignmentRequest) {
  return wireData<TripAssignmentWithMeta>('/trip-assignment', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTripAssignment(id: string, data: UpdateTripAssignmentRequest) {
  return wireData<TripAssignmentWithMeta>(`/trip-assignment/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteTripAssignment(id: string) {
  return wireData<void>(`/trip-assignment/${id}`, {
    method: 'DELETE',
  });
}
