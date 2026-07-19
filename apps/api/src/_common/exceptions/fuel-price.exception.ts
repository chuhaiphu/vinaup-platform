import { HttpStatus, UnprocessableEntityException } from '@nestjs/common';

export class FuelPriceFetchFailedException extends UnprocessableEntityException {
  constructor() {
    super({ error: 'FUEL_PRICE_FETCH_FAILED', message: 'Failed to fetch fuel prices from VNExpress API', statusCode: HttpStatus.UNPROCESSABLE_ENTITY });
  }
}
