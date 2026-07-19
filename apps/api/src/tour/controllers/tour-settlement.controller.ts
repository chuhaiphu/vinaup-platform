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
import { OrganizationTourSettlementMutationGuard } from 'src/_core/guards/organization-tour-settlement-mutation.guard';

import type { TourSettlementCancelLogResponse } from '../dtos/tour-settlement-cancel-log.response.dto';
import type { TourSettlementResponse, TourSettlementWithMeta } from '../dtos/tour-settlement.response.dto';
import { UpdateTourSettlementRequest } from '../dtos/update-tour-settlement.request.dto';
import { TourSettlementService } from '../services/tour-settlement.service';

@Controller('tour-settlement')
export class TourSettlementController {
  constructor(private readonly tourSettlementService: TourSettlementService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/cancel-logs/:id')
  async findCancelLogById(
    @Param('id') id: string
  ): Promise<HttpResponse<TourSettlementCancelLogResponse>> {
    const data =
      await this.tourSettlementService.findTourSettlementCancelLogById(id);

    return {
      statusCode: HttpStatus.OK,
      message: 'Tour settlement cancel log retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id/cancel-logs')
  async findCancelLogsByTourSettlementId(
    @Param('id') id: string
  ): Promise<HttpResponse<TourSettlementCancelLogResponse[]>> {
    const data =
      await this.tourSettlementService.findTourSettlementCancelLogsByTourSettlementId(
        id
      );

    return {
      statusCode: HttpStatus.OK,
      message: 'Tour settlement cancel logs retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/by-tour/:tourId')
  async findByTourId(
    @Param('tourId') tourId: string
  ): Promise<HttpResponse<TourSettlementWithMeta>> {
    const data = await this.tourSettlementService.findTourSettlementByTourId(tourId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Tour settlement retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard, OrganizationTourSettlementMutationGuard)
  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateTourSettlementRequest
  ): Promise<HttpResponse<TourSettlementResponse>> {
    const data = await this.tourSettlementService.updateTourSettlement(
      id,
      body
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Tour settlement updated successfully',
      data,
    };
  }
}
