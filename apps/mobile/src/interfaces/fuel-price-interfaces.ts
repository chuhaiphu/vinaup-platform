export interface FuelPriceResponse {
  id: string;
  e10Ron95: number;
  e5Ron92: number;
  diesel: number;
  electricity: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateFuelPriceRequest {
  electricity: number;
}
