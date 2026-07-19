import { wireApi } from 'fetchwire';

import {
  TourSettlementCancelLogResponse,
  TourSettlementResponse,
  TourSettlementWithMeta,
  UpdateTourSettlementRequest,
} from '@/interfaces/tour-settlement-interfaces';

export async function getTourSettlementByTourId(tourId: string) {
  return wireApi<TourSettlementWithMeta>(`/tour-settlement/by-tour/${tourId}`, {
    method: 'GET',
  });
}

export async function updateTourSettlement(
  tourSettlementId: string,
  data: UpdateTourSettlementRequest,
) {
  return wireApi<TourSettlementResponse>(`/tour-settlement/${tourSettlementId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getTourSettlementLogsByTourSettlementId(tourSettlementId: string) {
  return wireApi<TourSettlementCancelLogResponse[]>(
    `/tour-settlement/${tourSettlementId}/cancel-logs`,
    {
      method: 'GET',
    },
  );
}

export async function getTourSettlementCancelLogById(id: string) {
  return wireApi<TourSettlementCancelLogResponse>(`/tour-settlement/cancel-logs/${id}`, {
    method: 'GET',
  });
}
