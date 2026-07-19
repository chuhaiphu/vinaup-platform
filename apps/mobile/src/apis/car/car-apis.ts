import { wireApi } from 'fetchwire';

import { CarFilterParam } from '@/interfaces/_query-param-interfaces';
import {
  CarAssignmentEventResponse,
  CarAssignmentResponse,
  CarMaintenanceLogResponse,
  CarResponse,
  CreateCarAssignmentRequest,
  CreateCarRequest,
  UpdateCarRequest,
} from '@/interfaces/car-interfaces';
import { generateFilterQueryString } from '@/utils/generator/string-generator/generate-filter-query-string';

// ─── Car CRUD ────────────────────────────────────────────────────────────────

export async function getCarsByOrganizationId(organizationId: string, filter?: CarFilterParam) {
  const filterQueryString = generateFilterQueryString(filter, {
    name: filter?.name,
    status: filter?.status,
    category: filter?.category,
    fuelType: filter?.fuelType,
  });
  return wireApi<CarResponse[]>(`/car/organization/${organizationId}${filterQueryString}`, {
    method: 'GET',
  });
}

export async function getCarById(id: string) {
  return wireApi<CarResponse>(`/car/${id}`, { method: 'GET' });
}

export async function createCar(data: CreateCarRequest) {
  return wireApi<CarResponse>('/car', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCar(id: string, data: UpdateCarRequest) {
  return wireApi<CarResponse>(`/car/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCarById(id: string) {
  return wireApi<null>(`/car/${id}`, { method: 'DELETE' });
}

// ─── Car Assignment (current state) ─────────────────────────────────────────────

export async function getCarAssignmentsByCarId(carId: string) {
  return wireApi<CarAssignmentResponse[]>(`/car-assignment/car/${carId}`, { method: 'GET' });
}

export async function getCarAssignmentsByOrganizationMemberId(organizationMemberId: string) {
  return wireApi<CarAssignmentResponse[]>(`/car-assignment/member/${organizationMemberId}`, {
    method: 'GET',
  });
}

// Reconcile: send the FULL desired active member set; the API diffs it against the
// current state and records the resulting assign/unassign events as history.
export async function createCarAssignment(data: CreateCarAssignmentRequest) {
  return wireApi<CarAssignmentResponse[]>('/car-assignment', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Car Assignment History (append-only audit trail) ───────────────────────────

export async function getCarAssignmentHistoryByCarId(carId: string) {
  return wireApi<CarAssignmentEventResponse[]>(`/car-assignment/history/car/${carId}`, {
    method: 'GET',
  });
}

// ─── Car Maintenance Log ──────────────────────────────────────────────────────

export async function getCarMaintenanceLogById(id: string) {
  return wireApi<CarMaintenanceLogResponse>(`/car-maintenance-log/${id}`, {
    method: 'GET',
  });
}

export async function getCarMaintenanceLogByCarId(carId: string) {
  return wireApi<CarMaintenanceLogResponse>(`/car-maintenance-log/car/${carId}`, {
    method: 'GET',
  });
}

// ─── Car Expiry check ──────────────────────────────────────────────────────────

export async function getExpiringCars(organizationId: string) {
  return wireApi<CarResponse[]>(`/car/organization/${organizationId}/expiring`, {
    method: 'GET',
  });
}
