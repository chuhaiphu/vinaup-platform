import { Injectable } from '@nestjs/common';

import { CarMaintenanceLogNotFoundException } from 'src/_common/exceptions/car.exception';
import { PrismaService } from 'src/prisma/prisma.service';

import { CarMaintenanceLogResponse } from '../dtos/car-maintenance-log.response.dto';

@Injectable()
export class CarMaintenanceLogService {
  constructor(private readonly prismaService: PrismaService) {}

  async findCarMaintenanceLogById(id: string): Promise<CarMaintenanceLogResponse> {
    const log = await this.prismaService.carMaintenanceLog.findUnique({
      where: { id },
      include: { car: true },
    });

    if (!log) {
      throw new CarMaintenanceLogNotFoundException();
    }

    return log;
  }

  async findCarMaintenanceLogByCarId(carId: string): Promise<CarMaintenanceLogResponse> {
    const log = await this.prismaService.carMaintenanceLog.findUnique({
      where: { carId },
      include: { car: true },
    });

    if (!log) {
      throw new CarMaintenanceLogNotFoundException();
    }

    return log;
  }
}
