import { Controller, Get, HttpStatus, Param, UseGuards } from '@nestjs/common';

import type { HttpResponse } from 'src/_common/interfaces/interface';
import { JwtAuthGuard } from 'src/_core/guards/jwt-auth.guard';

import type { CarMaintenanceLogResponse } from '../dtos/car-maintenance-log.response.dto';
import { CarMaintenanceLogService } from '../services/car-maintenance-log.service';

@Controller('car-maintenance-log')
export class CarMaintenanceLogController {
  constructor(private readonly carMaintenanceLogService: CarMaintenanceLogService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/car/:carId')
  async findByCarId(
    @Param('carId') carId: string,
  ): Promise<HttpResponse<CarMaintenanceLogResponse>> {
    const data = await this.carMaintenanceLogService.findCarMaintenanceLogByCarId(carId);
    return { statusCode: HttpStatus.OK, message: 'Car maintenance log retrieved successfully', data };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async findById(
    @Param('id') id: string,
  ): Promise<HttpResponse<CarMaintenanceLogResponse>> {
    const data = await this.carMaintenanceLogService.findCarMaintenanceLogById(id);
    return { statusCode: HttpStatus.OK, message: 'Car maintenance log retrieved successfully', data };
  }
}
