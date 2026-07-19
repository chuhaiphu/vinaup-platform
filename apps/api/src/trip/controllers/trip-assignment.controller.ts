import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';

import type { HttpResponse } from 'src/_common/interfaces/interface';
import { JwtAuthGuard } from 'src/_core/guards/jwt-auth.guard';

import { CreateTripAssignmentRequest } from '../dtos/create-trip-assignment.request.dto';
import { TripAssignmentWithMeta } from '../dtos/trip-assignment.response.dto';
import { UpdateTripAssignmentRequest } from '../dtos/update-trip-assignment.request.dto';
import { TripAssignmentService } from '../services/trip-assignment.service';

@Controller('trip-assignment')
export class TripAssignmentController {
  constructor(private readonly tripAssignmentService: TripAssignmentService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/trip/:tripId')
  async findByTripId(@Param('tripId') tripId: string): Promise<HttpResponse<TripAssignmentWithMeta[]>> {
    const data = await this.tripAssignmentService.findTripAssignmentsByTripId(tripId);
    return { statusCode: HttpStatus.OK, message: 'Trip assignments retrieved successfully', data };
  }

  @UseGuards(JwtAuthGuard)
  @Post('/')
  async create(
    @Body() createTripAssignmentReq: CreateTripAssignmentRequest,
  ): Promise<HttpResponse<TripAssignmentWithMeta>> {
    const data = await this.tripAssignmentService.createTripAssignment(createTripAssignmentReq);
    return { statusCode: HttpStatus.CREATED, message: 'Trip assignment created successfully', data };
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateTripAssignmentReq: UpdateTripAssignmentRequest,
  ): Promise<HttpResponse<TripAssignmentWithMeta>> {
    const data = await this.tripAssignmentService.updateTripAssignment(id, updateTripAssignmentReq);
    return { statusCode: HttpStatus.OK, message: 'Trip assignment updated successfully', data };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async delete(@Param('id') id: string): Promise<HttpResponse<null>> {
    await this.tripAssignmentService.deleteTripAssignmentById(id);
    return { statusCode: HttpStatus.OK, message: 'Trip assignment deleted successfully', data: null };
  }
}
