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
import { PERMISSION_ACTION, PERMISSION_RESOURCE } from '@vinaup-platform/permission';

import type {
  AuthenticatedRequest,
  HttpResponse,
} from 'src/_common/interfaces/interface';
import { CheckAbility } from 'src/_core/decorators/check-ability.decorator';
import { JwtAuthGuard } from 'src/_core/guards/jwt-auth.guard';
import { OrganizationPermissionGuard } from 'src/_core/guards/organization-permission.guard';

import { CreateTripRequest } from '../dtos/create-trip.request.dto';
import { TripFilterRequest } from '../dtos/trip-filter.request.dto';
import type { TripResponse } from '../dtos/trip.response.dto';
import { UpdateTripRequest } from '../dtos/update-trip.request.dto';
import { TripService } from '../services/trip.service';

@Controller('trip')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
  @CheckAbility(PERMISSION_ACTION.READ, PERMISSION_RESOURCE.TRIP)
  @Get('/organization/:organizationId')
  async findByOrganizationId(
    @Param('organizationId') organizationId: string,
    @Query() filter: TripFilterRequest
  ): Promise<HttpResponse<TripResponse[]>> {
    const data = await this.tripService.findTripsByOrganizationId(
      organizationId,
      filter
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Trips retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
  @CheckAbility(PERMISSION_ACTION.CREATE, PERMISSION_RESOURCE.TRIP)
  @Post('/')
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createTripReq: CreateTripRequest
  ): Promise<HttpResponse<TripResponse>> {
    const data = await this.tripService.createTrip(
      createTripReq,
      req.user.userId
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Trip created successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async findById(
    @Param('id') id: string
  ): Promise<HttpResponse<TripResponse>> {
    const data = await this.tripService.findTripById(id);

    return {
      statusCode: HttpStatus.OK,
      message: 'Trip retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateTripReq: UpdateTripRequest
  ): Promise<HttpResponse<TripResponse>> {
    const data = await this.tripService.updateTrip(id, updateTripReq);

    return {
      statusCode: HttpStatus.OK,
      message: 'Trip updated successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async delete(@Param('id') id: string): Promise<HttpResponse<null>> {
    await this.tripService.deleteTripById(id);

    return {
      statusCode: HttpStatus.OK,
      message: 'Trip deleted successfully',
      data: null,
    };
  }
}
