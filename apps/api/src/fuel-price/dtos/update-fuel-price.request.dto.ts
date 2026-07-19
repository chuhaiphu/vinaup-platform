import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateFuelPriceRequest {
  @IsNumber()
  @IsNotEmpty()
  electricity!: number;
}
