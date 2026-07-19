import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';

import type {
  AuthenticatedRequest,
  HttpResponse,
} from 'src/_common/interfaces/interface';
import { JwtAuthGuard } from 'src/_core/guards/jwt-auth.guard';
import { OrganizationTourMutationGuard } from 'src/_core/guards/organization-tour-mutation.guard';

import { CreateTourRequest } from '../dtos/create-tour.request.dto';
import { TourFilterParam } from '../dtos/tour-filter.param.dto';
import { TourResponse } from '../dtos/tour.response.dto';
import { UpdateTourRequest } from '../dtos/update-tour.request.dto';
import { TourService } from '../services/tour.service';

@Controller('tour')
export class TourController {
  constructor(private readonly tourService: TourService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/organization/:organizationId')
  async findByOrganizationId(
    @Param('organizationId') organizationId: string,
    @Query() filter: TourFilterParam
  ): Promise<HttpResponse<TourResponse[]>> {
    const data = await this.tourService.findToursByOrganizationId(
      organizationId,
      filter
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Tours retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('/')
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createTourReq: CreateTourRequest
  ): Promise<HttpResponse<TourResponse>> {
    const data = await this.tourService.createTour(createTourReq, req.user.userId);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Tour created successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async findById(@Param('id') id: string): Promise<HttpResponse<TourResponse>> {
    const data = await this.tourService.findTourById(id);

    return {
      statusCode: HttpStatus.OK,
      message: 'Tour retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard, OrganizationTourMutationGuard)
  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateTourReq: UpdateTourRequest
  ): Promise<HttpResponse<TourResponse>> {
    const data = await this.tourService.updateTour(id, updateTourReq);

    return {
      statusCode: HttpStatus.OK,
      message: 'Tour updated successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard, OrganizationTourMutationGuard)
  @Delete('/:id')
  async delete(@Param('id') id: string): Promise<HttpResponse<null>> {
    await this.tourService.deleteTourById(id);

    return {
      statusCode: HttpStatus.OK,
      message: 'Tour deleted successfully',
      data: null,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:tourId/import-receipt-payments')
  async importReceiptPayments(
    @Request() req: AuthenticatedRequest,
    @Param('tourId') tourId: string
  ): Promise<HttpResponse<null>> {
    await this.tourService.importReceiptPaymentFromTourCalculationToTourImplementation(
      tourId,
      req.user.userId
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Receipt payments imported successfully',
      data: null,
    };
  }
}
