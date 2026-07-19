import { wireApi } from 'fetchwire';

import {
  TourCalculationCancelLogResponse,
  TourCalculationResponse,
  TourCalculationWithMeta,
  UpdateTourCalculationRequest,
} from '@/interfaces/tour-calculation-interfaces';

export async function getTourCalculationByTourId(tourId: string) {
  return wireApi<TourCalculationWithMeta>(`/tour-calculation/by-tour/${tourId}`, {
    method: 'GET',
  });
}

export async function getTourCalculationLogsByTourCalculationId(tourCalculationId: string) {
  return wireApi<TourCalculationCancelLogResponse[]>(
    `/tour-calculation/${tourCalculationId}/cancel-logs`,
    {
      method: 'GET',
    },
  );
}

export async function getTourCalculationCancelLogById(id: string) {
  return wireApi<TourCalculationCancelLogResponse>(`/tour-calculation/cancel-logs/${id}`, {
    method: 'GET',
  });
}

export async function updateTourCalculation(
  tourCalculationId: string,
  data: UpdateTourCalculationRequest,
) {
  return wireApi<TourCalculationResponse>(`/tour-calculation/${tourCalculationId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
