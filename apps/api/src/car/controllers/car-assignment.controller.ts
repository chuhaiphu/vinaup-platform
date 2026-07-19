import { Body, Controller, Get, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';

import type { HttpResponse } from 'src/_common/interfaces/interface';
import { JwtAuthGuard } from 'src/_core/guards/jwt-auth.guard';

import { CarAssignmentEventResponse } from '../dtos/car-assignment-event.response.dto';
import { CarAssignmentResponse } from '../dtos/car-assignment.response.dto';
import { CreateCarAssignmentRequest } from '../dtos/create-car-assignment.request.dto';
import { CarAssignmentService } from '../services/car-assignment.service';

@Controller('car-assignment')
export class CarAssignmentController {
  constructor(private readonly carAssignmentService: CarAssignmentService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/car/:carId')
  async findByCarId(@Param('carId') carId: string): Promise<HttpResponse<CarAssignmentResponse[]>> {
    const data = await this.carAssignmentService.findCarAssignmentsByCarId(carId);
    return { statusCode: HttpStatus.OK, message: 'Car assignments retrieved successfully', data };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/member/:organizationMemberId')
  async findByOrganizationMemberId(
    @Param('organizationMemberId') organizationMemberId: string,
  ): Promise<HttpResponse<CarAssignmentResponse[]>> {
    const data =
      await this.carAssignmentService.findCarAssignmentsByOrganizationMemberId(organizationMemberId);
    return { statusCode: HttpStatus.OK, message: 'Car assignments retrieved successfully', data };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/history/car/:carId')
  async findHistoryByCarId(
    @Param('carId') carId: string,
  ): Promise<HttpResponse<CarAssignmentEventResponse[]>> {
    const data = await this.carAssignmentService.findCarAssignmentEventsByCarId(carId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Car assignment history retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('/')
  async create(
    @Body() createCarAssignmentReq: CreateCarAssignmentRequest,
  ): Promise<HttpResponse<CarAssignmentResponse[]>> {
    const data = await this.carAssignmentService.createCarAssignment(createCarAssignmentReq);
    return { statusCode: HttpStatus.CREATED, message: 'Car assignments created successfully', data };
  }
}
