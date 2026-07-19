import { Body, Controller, Get, HttpStatus, Patch, Post, UseGuards } from '@nestjs/common';

import type { HttpResponse } from 'src/_common/interfaces/interface';
import { JwtAuthGuard } from 'src/_core/guards/jwt-auth.guard';

import { FuelPriceResponse } from './dtos/fuel-price.response.dto';
import { UpdateFuelPriceRequest } from './dtos/update-fuel-price.request.dto';
import { FuelPriceService } from './fuel-price.service';

@Controller('fuel-price')
export class FuelPriceController {
  constructor(private readonly fuelPriceService: FuelPriceService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/')
  async get(): Promise<HttpResponse<FuelPriceResponse | null>> {
    const data = await this.fuelPriceService.getFuelPrice();
    return {
      statusCode: HttpStatus.OK,
      message: 'Fuel price retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('/sync')
  async sync(): Promise<HttpResponse<FuelPriceResponse>> {
    const data = await this.fuelPriceService.syncFuelPrice();
    return {
      statusCode: HttpStatus.OK,
      message: 'Fuel prices synced successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/')
  async updateElectricity(
    @Body() updateFuelPriceReq: UpdateFuelPriceRequest
  ): Promise<HttpResponse<FuelPriceResponse>> {
    const data = await this.fuelPriceService.updateElectricity(updateFuelPriceReq);
    return {
      statusCode: HttpStatus.OK,
      message: 'Electricity price updated successfully',
      data,
    };
  }
}
