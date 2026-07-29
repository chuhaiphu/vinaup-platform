import { wireData } from 'fetchwire';

import { FuelPriceResponse, UpdateFuelPriceRequest } from '@/interfaces/fuel-price-interfaces';

export async function getFuelPrice() {
  return wireData<FuelPriceResponse | null>('/fuel-price/', { method: 'GET' });
}

export async function syncFuelPrice() {
  return wireData<FuelPriceResponse>('/fuel-price/sync', { method: 'POST' });
}

export async function updateFuelPriceElectricity(data: UpdateFuelPriceRequest) {
  return wireData<FuelPriceResponse>('/fuel-price/', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
