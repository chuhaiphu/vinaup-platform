import { wireApi } from 'fetchwire';

import { FuelPriceResponse, UpdateFuelPriceRequest } from '@/interfaces/fuel-price-interfaces';

export async function getFuelPrice() {
  return wireApi<FuelPriceResponse | null>('/fuel-price/', { method: 'GET' });
}

export async function syncFuelPrice() {
  return wireApi<FuelPriceResponse>('/fuel-price/sync', { method: 'POST' });
}

export async function updateFuelPriceElectricity(data: UpdateFuelPriceRequest) {
  return wireApi<FuelPriceResponse>('/fuel-price/', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
