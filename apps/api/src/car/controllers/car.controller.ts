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

import type { AuthenticatedRequest, HttpResponse } from 'src/_common/interfaces/interface';
import { CheckAbility } from 'src/_core/decorators/check-ability.decorator';
import { JwtAuthGuard } from 'src/_core/guards/jwt-auth.guard';
import { OrganizationPermissionGuard } from 'src/_core/guards/organization-permission.guard';

import { CarFilterRequest } from '../dtos/car-filter.request.dto';
import type { CarWithMeta } from '../dtos/car.response.dto';
import { CreateCarRequest } from '../dtos/create-car.request.dto';
import { UpdateCarRequest } from '../dtos/update-car.request.dto';
import { CarService } from '../services/car.service';

@Controller('car')
export class CarController {
  constructor(private readonly carService: CarService) {}

  @UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
  @CheckAbility(PERMISSION_ACTION.READ, PERMISSION_RESOURCE.CAR)
  @Get('/organization/:organizationId')
  async findByOrganizationId(
    @Param('organizationId') organizationId: string,
    @Query() filter: CarFilterRequest,
  ): Promise<HttpResponse<CarWithMeta[]>> {
    const data = await this.carService.findCarsByOrganizationId(organizationId, filter);
    return { statusCode: HttpStatus.OK, message: 'Cars retrieved successfully', data };
  }

  @UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
  @CheckAbility(PERMISSION_ACTION.READ, PERMISSION_RESOURCE.CAR)
  @Get('/organization/:organizationId/expiring')
  async findExpiringByOrganizationId(
    @Param('organizationId') organizationId: string,
  ): Promise<HttpResponse<CarWithMeta[]>> {
    const data = await this.carService.findExpiringCars(organizationId);
    return { statusCode: HttpStatus.OK, message: 'Expiring cars retrieved successfully', data };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async findById(
    @Param('id') id: string,
  ): Promise<HttpResponse<CarWithMeta>> {
    const data = await this.carService.findCarById(id);
    return { statusCode: HttpStatus.OK, message: 'Car retrieved successfully', data };
  }

  @UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
  @CheckAbility(PERMISSION_ACTION.CREATE, PERMISSION_RESOURCE.CAR)
  @Post('/')
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createCarReq: CreateCarRequest,
  ): Promise<HttpResponse<CarWithMeta>> {
    const data = await this.carService.createCar(createCarReq, req.user.userId);
    return { statusCode: HttpStatus.CREATED, message: 'Car created successfully', data };
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateCarReq: UpdateCarRequest,
  ): Promise<HttpResponse<CarWithMeta>> {
    const data = await this.carService.updateCar(id, updateCarReq);
    return { statusCode: HttpStatus.OK, message: 'Car updated successfully', data };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async delete(
    @Param('id') id: string,
  ): Promise<HttpResponse<null>> {
    await this.carService.deleteCarById(id);
    return { statusCode: HttpStatus.OK, message: 'Car deleted successfully', data: null };
  }
}
