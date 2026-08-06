import { Injectable } from '@nestjs/common';

import { CarMaintenanceLogNotFoundException } from 'src/_common/exceptions/car.exception';
import { PrismaService } from 'src/prisma/prisma.service';
import { StorageService } from 'src/storage/storage.service';

import { toCarMaintenanceLogResponse, carMaintenanceLogQueryArgs, type CarMaintenanceLogResponse } from '../dtos/car-maintenance-log.response.dto';

@Injectable()
export class CarMaintenanceLogService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async findCarMaintenanceLogById(id: string): Promise<CarMaintenanceLogResponse> {
    const log = await this.prismaService.carMaintenanceLog.findUnique({
      where: { id },
      ...carMaintenanceLogQueryArgs,
    });

    if (!log) {
      throw new CarMaintenanceLogNotFoundException();
    }

    return toCarMaintenanceLogResponse(log, this.storageService);
  }

  async findCarMaintenanceLogByCarId(carId: string): Promise<CarMaintenanceLogResponse> {
    const log = await this.prismaService.carMaintenanceLog.findUnique({
      where: { carId },
      ...carMaintenanceLogQueryArgs,
    });

    if (!log) {
      throw new CarMaintenanceLogNotFoundException();
    }

    return toCarMaintenanceLogResponse(log, this.storageService);
  }
}
