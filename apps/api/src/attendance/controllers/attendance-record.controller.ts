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

import { AttendanceRecordFilterRequest } from '../dtos/attendance-record-filter.request.dto';
import type { AttendanceRecordResponse } from '../dtos/attendance-record.response.dto';
import { CheckOutAttendanceRecordRequest } from '../dtos/check-out-attendance-record.request.dto';
import { CreateAttendanceRecordRequest } from '../dtos/create-attendance-record.request.dto';
import { UpdateAttendanceRecordRequest } from '../dtos/update-attendance-record.request.dto';
import { AttendanceRecordService } from '../services/attendance-record.service';

@Controller('attendance-record')
export class AttendanceRecordController {
  constructor(private readonly attendanceRecordService: AttendanceRecordService) {}

  @UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
  @CheckAbility(PERMISSION_ACTION.CREATE, PERMISSION_RESOURCE.ATTENDANCE_RECORD)
  @Post('/')
  async checkIn(
    @Request() req: AuthenticatedRequest,
    @Body() createAttendanceRecordReq: CreateAttendanceRecordRequest,
  ): Promise<HttpResponse<AttendanceRecordResponse>> {
    const data = await this.attendanceRecordService.checkIn(createAttendanceRecordReq, req.user.userId);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Checked in successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('/check-out')
  async checkOut(
    @Request() req: AuthenticatedRequest,
    @Body() checkOutAttendanceRecordReq: CheckOutAttendanceRecordRequest,
  ): Promise<HttpResponse<AttendanceRecordResponse>> {
    const data = await this.attendanceRecordService.checkOut(checkOutAttendanceRecordReq, req.user.userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Checked out successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/')
  async findMyRecords(
    @Request() req: AuthenticatedRequest,
    @Query() filter: AttendanceRecordFilterRequest,
  ): Promise<HttpResponse<AttendanceRecordResponse[]>> {
    const data = await this.attendanceRecordService.findMyAttendanceRecords(req.user.userId, filter);
    return {
      statusCode: HttpStatus.OK,
      message: 'Attendance records retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
  @CheckAbility(PERMISSION_ACTION.READ, PERMISSION_RESOURCE.ATTENDANCE_RECORD)
  @Get('/organization/:organizationId')
  async findByOrganizationId(
    @Param('organizationId') organizationId: string,
    @Query() filter: AttendanceRecordFilterRequest,
  ): Promise<HttpResponse<AttendanceRecordResponse[]>> {
    const data = await this.attendanceRecordService.findByOrganizationId(organizationId, filter);
    return {
      statusCode: HttpStatus.OK,
      message: 'Attendance records retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async updateOwnRecord(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateAttendanceRecordReq: UpdateAttendanceRecordRequest,
  ): Promise<HttpResponse<AttendanceRecordResponse>> {
    const data = await this.attendanceRecordService.updateAttendanceRecord(
      id,
      updateAttendanceRecordReq,
      req.user.userId,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Attendance record updated successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async deleteOwnRecord(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<HttpResponse<null>> {
    await this.attendanceRecordService.deleteAttendanceRecord(id, req.user.userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Attendance record deleted successfully',
      data: null,
    };
  }
}
