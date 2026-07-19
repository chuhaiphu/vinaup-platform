import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';

import type { HttpResponse } from 'src/_common/interfaces/interface';
import { JwtAuthGuard } from 'src/_core/guards/jwt-auth.guard';
import { OrganizationTourCalculationMutationGuard } from 'src/_core/guards/organization-tour-calculation-mutation.guard';

import { TourCalculationCancelLogResponse } from '../dtos/tour-calculation-cancel-log.response.dto';
import { TourCalculationResponse, TourCalculationWithMeta } from '../dtos/tour-calculation.response.dto';
import { UpdateTourCalculationRequest } from '../dtos/update-tour-calculation.request.dto';
import { TourCalculationService } from '../services/tour-calculation.service';

@Controller('tour-calculation')
export class TourCalculationController {
  constructor(private readonly tourCalculationService: TourCalculationService) {}

  // Static segments before dynamic /:id
  @UseGuards(JwtAuthGuard)
  @Get('/cancel-logs/:id')
  async findCancelLogById(
    @Param('id') id: string
  ): Promise<HttpResponse<TourCalculationCancelLogResponse>> {
    const data = await this.tourCalculationService.findTourCalculationCancelLogById(id);

    return {
      statusCode: HttpStatus.OK,
      message: 'Tour calculation cancel log retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/by-tour/:tourId')
  async findByTourId(
    @Param('tourId') tourId: string
  ): Promise<HttpResponse<TourCalculationWithMeta>> {
    const data = await this.tourCalculationService.findTourCalculationByTourId(tourId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Tour calculation retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id/cancel-logs')
  async findCancelLogsByTourCalculationId(
    @Param('id') id: string
  ): Promise<HttpResponse<TourCalculationCancelLogResponse[]>> {
    const data =
      await this.tourCalculationService.findTourCalculationCancelLogsByTourCalculationId(
        id
      );

    return {
      statusCode: HttpStatus.OK,
      message: 'Tour calculation cancel logs retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard, OrganizationTourCalculationMutationGuard)
  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateTourCalculationReq: UpdateTourCalculationRequest
  ): Promise<HttpResponse<TourCalculationResponse>> {
    const data = await this.tourCalculationService.updateTourCalculation(
      id,
      updateTourCalculationReq
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Tour calculation updated successfully',
      data,
    };
  }
}
