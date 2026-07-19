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

import { BusyDateRange } from 'src/_common/dtos/response/busy-days.response.dto';
import type { AuthenticatedRequest, HttpResponse } from 'src/_common/interfaces/interface';
import { JwtAuthGuard } from 'src/_core/guards/jwt-auth.guard';

import { CreateWageRequest } from './dtos/create-wage.request.dto';
import { UpdateWageRequest } from './dtos/update-wage.request.dto';
import { WageFilterParam } from './dtos/wage-filter.param.dto';
import { WageResponse } from './dtos/wage.response.dto';
import { WageService } from './wage.service';

@Controller('wage')
export class WageController {
  constructor(private readonly wageService: WageService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findByCurrentUser(
    @Request() req: AuthenticatedRequest,
    @Query() filter: WageFilterParam,
  ): Promise<HttpResponse<WageResponse[]>> {
    const data = await this.wageService.findWagesByCurrentUser(req.user.userId, filter);
    return {
      statusCode: HttpStatus.OK,
      message: 'Wages retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('/')
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createWageReq: CreateWageRequest,
  ): Promise<HttpResponse<WageResponse>> {
    const data = await this.wageService.createWage(createWageReq, req.user.userId);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Wage created successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('busy-days')
  async findBusyDays(
    @Request() req: AuthenticatedRequest,
  ): Promise<HttpResponse<BusyDateRange[]>> {
    const data = await this.wageService.findBusyDaysByCurrentUser(
      req.user.userId,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Wage busy days retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async findById(@Param('id') id: string): Promise<HttpResponse<WageResponse>> {
    const data = await this.wageService.findWageById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Wage retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateWageReq: UpdateWageRequest,
  ): Promise<HttpResponse<WageResponse>> {
    const data = await this.wageService.updateWage(id, updateWageReq);
    return {
      statusCode: HttpStatus.OK,
      message: 'Wage updated successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async delete(@Param('id') id: string): Promise<HttpResponse<null>> {
    await this.wageService.deleteWageById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Wage deleted successfully',
      data: null,
    };
  }
}
