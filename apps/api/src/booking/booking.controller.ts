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
import { OrganizationBookingMutationGuard } from 'src/_core/guards/organization-booking-mutation.guard';

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

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard, OrganizationBookingMutationGuard)
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

  @UseGuards(JwtAuthGuard, OrganizationBookingMutationGuard)
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
