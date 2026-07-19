import { Injectable } from '@nestjs/common';

import { VNEXPRESS_FUEL_API_URL } from 'src/_common/constants/fuel-price.constant';
import { FuelPriceFetchFailedException } from 'src/_common/exceptions/fuel-price.exception';
import type { VnexpressFuelApiResponse } from 'src/_common/interfaces/fuel-price.interface';
import { PrismaService } from 'src/prisma/prisma.service';

import type { FuelPriceResponse } from './dtos/fuel-price.response.dto';
import type { UpdateFuelPriceRequest } from './dtos/update-fuel-price.request.dto';

@Injectable()
export class FuelPriceService {
  constructor(private readonly prismaService: PrismaService) {}

  async getFuelPrice(): Promise<FuelPriceResponse | null> {
    return this.prismaService.fuelPrice.findFirst();
  }

  async syncFuelPrice(): Promise<FuelPriceResponse> {
    // ─── Step 1: Fetch current prices from VNExpress public API ─────
    // This API aggregates petrolimex.com.vn prices and is publicly accessible
    let apiData: VnexpressFuelApiResponse;
    try {
      const response = await fetch(VNEXPRESS_FUEL_API_URL);
      apiData = await response.json() as VnexpressFuelApiResponse;
    } catch {
      throw new FuelPriceFetchFailedException();
    }

    // ─── Step 2: Extract the 3 required fuel prices ─────
    // VNExpress wraps the payload in a double envelope, so gas_oil lives at data.data.gas_oil
    const { ron_95, e5_ron_92, dau_diesel } = apiData.data.data.gas_oil;
    const fuelPriceData = {
      e10Ron95: ron_95.price,
      e5Ron92: e5_ron_92.price,
      diesel: dau_diesel.price,
    };

    // ─── Step 3: Upsert singleton record — preserve electricity if it already exists ─────
    return this.prismaService.fuelPrice.upsert({
      where: { id: 'SINGLETON' },
      update: fuelPriceData,
      create: { id: 'SINGLETON', ...fuelPriceData, electricity: 0 },
    });
  }

  async updateElectricity(dto: UpdateFuelPriceRequest): Promise<FuelPriceResponse> {
    return this.prismaService.fuelPrice.upsert({
      where: { id: 'SINGLETON' },
      update: { electricity: dto.electricity },
      create: { id: 'SINGLETON', e10Ron95: 0, e5Ron92: 0, diesel: 0, electricity: dto.electricity },
    });
  }
}
