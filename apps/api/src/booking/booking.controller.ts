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

import {
  TOUR_IMPLEMENTATION_ACCESS_LEVEL,
  TOUR_TARGET_RESOURCE,
} from 'src/_common/constants/tour.constant';
import type {
  AuthenticatedRequest,
  HttpResponse,
} from 'src/_common/interfaces/interface';
import { CheckAbility } from 'src/_core/decorators/check-ability.decorator';
import { CheckTourImplementationAccess } from 'src/_core/decorators/tour-implementation-access.decorator';
import { JwtAuthGuard } from 'src/_core/guards/jwt-auth.guard';
import { OrganizationPermissionGuard } from 'src/_core/guards/organization-permission.guard';
import { TourImplementationAccessGuard } from 'src/_core/guards/tour-implementation-access.guard';

import { BookingService } from './booking.service';
import { BookingFilterRequest } from './dtos/booking-filter.request.dto';
import {
  BookingResponse,
  BookingWithMeta,
} from './dtos/booking.response.dto';
import { CreateBookingRequest } from './dtos/create-booking.request.dto';
import { UpdateBookingRequest } from './dtos/update-booking.request.dto';


@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
  @CheckAbility(PERMISSION_ACTION.READ, PERMISSION_RESOURCE.BOOKING)
  @Get('/organization/:organizationId')
  async findByOrganizationId(
    @Param('organizationId') organizationId: string,
    @Query() filter: BookingFilterRequest
  ): Promise<HttpResponse<BookingWithMeta[]>> {
    const data = await this.bookingService.findBookingsByOrganizationId(
      organizationId,
      filter
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Bookings retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
  @CheckAbility(PERMISSION_ACTION.CREATE, PERMISSION_RESOURCE.BOOKING)
  @Post('/')
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createBookingReq: CreateBookingRequest
  ): Promise<HttpResponse<BookingResponse>> {
    const data = await this.bookingService.createBooking(
      createBookingReq,
      req.user.userId
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Booking created successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard, TourImplementationAccessGuard)
  @CheckTourImplementationAccess({
    source: 'param',
    idKey: 'tourImplementationId',
    targetResource: TOUR_TARGET_RESOURCE.TOUR_IMPLEMENTATION,
    requiredAccessLevel: TOUR_IMPLEMENTATION_ACCESS_LEVEL.ASSIGNEE,
  })
  @Get('/tour-implementation/:tourImplementationId')
  async findByTourImplementationId(
    @Param('tourImplementationId') tourImplementationId: string,
    @Query() filter: BookingFilterRequest
  ): Promise<HttpResponse<BookingResponse[]>> {
    const data = await this.bookingService.findBookingsByTourImplementationId(
      tourImplementationId,
      filter
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Bookings retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
  @CheckAbility(PERMISSION_ACTION.READ, PERMISSION_RESOURCE.BOOKING)
  @Get('/by-organization-customer/organization/:organizationId')
  async findByOrganizationCustomerOrganizationId(
    @Param('organizationId') organizationId: string,
    @Query() filter: BookingFilterRequest
  ): Promise<HttpResponse<BookingWithMeta[]>> {
    const data =
      await this.bookingService.findBookingsByOrganizationCustomerOrganizationId(
        organizationId,
        filter
      );

    return {
      statusCode: HttpStatus.OK,
      message: 'Bookings retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async findById(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest
  ): Promise<HttpResponse<BookingWithMeta>> {
    const data = await this.bookingService.findBookingById(id, req.user.userId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Booking retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
  @CheckAbility(PERMISSION_ACTION.UPDATE, PERMISSION_RESOURCE.BOOKING)
  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateBookingReq: UpdateBookingRequest
  ): Promise<HttpResponse<BookingResponse>> {
    const data = await this.bookingService.updateBooking(id, updateBookingReq);

    return {
      statusCode: HttpStatus.OK,
      message: 'Booking updated successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
  @CheckAbility(PERMISSION_ACTION.DELETE, PERMISSION_RESOURCE.BOOKING)
  @Delete('/:id')
  async delete(@Param('id') id: string): Promise<HttpResponse<null>> {
    await this.bookingService.deleteBookingById(id);

    return {
      statusCode: HttpStatus.OK,
      message: 'Booking deleted successfully',
      data: null,
    };
  }
}
