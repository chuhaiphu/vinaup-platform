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

import type { AttendanceConclusionResponse } from '../dtos/attendance-conclusion.response.dto';
import { AttendanceRecordFilterRequest } from '../dtos/attendance-record-filter.request.dto';
import { CreateAttendanceConclusionRequest } from '../dtos/create-attendance-conclusion.request.dto';
import { UpdateAttendanceConclusionRequest } from '../dtos/update-attendance-conclusion.request.dto';
import { AttendanceConclusionService } from '../services/attendance-conclusion.service';

@Controller('attendance-conclusion')
export class AttendanceConclusionController {
  constructor(private readonly attendanceConclusionService: AttendanceConclusionService) {}

  @UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
  @CheckAbility(PERMISSION_ACTION.CREATE, PERMISSION_RESOURCE.ATTENDANCE_CONCLUSION)
  @Post('/')
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createAttendanceConclusionReq: CreateAttendanceConclusionRequest,
  ): Promise<HttpResponse<AttendanceConclusionResponse>> {
    const data = await this.attendanceConclusionService.create(
      createAttendanceConclusionReq,
      req.user.userId,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Attendance conclusion created successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
  @CheckAbility(PERMISSION_ACTION.READ, PERMISSION_RESOURCE.ATTENDANCE_CONCLUSION)
  @Get('/organization/:organizationId')
  async findByOrganizationId(
    @Param('organizationId') organizationId: string,
    @Query() filter: AttendanceRecordFilterRequest,
  ): Promise<HttpResponse<AttendanceConclusionResponse[]>> {
    const data = await this.attendanceConclusionService.findByOrganizationId(organizationId, filter);
    return {
      statusCode: HttpStatus.OK,
      message: 'Attendance conclusions retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
  @CheckAbility(PERMISSION_ACTION.UPDATE, PERMISSION_RESOURCE.ATTENDANCE_CONCLUSION)
  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateAttendanceConclusionReq: UpdateAttendanceConclusionRequest,
  ): Promise<HttpResponse<AttendanceConclusionResponse>> {
    const data = await this.attendanceConclusionService.update(id, updateAttendanceConclusionReq);
    return {
      statusCode: HttpStatus.OK,
      message: 'Attendance conclusion updated successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
  @CheckAbility(PERMISSION_ACTION.DELETE, PERMISSION_RESOURCE.ATTENDANCE_CONCLUSION)
  @Delete('/:id')
  async delete(@Param('id') id: string): Promise<HttpResponse<null>> {
    await this.attendanceConclusionService.delete(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Attendance conclusion deleted successfully',
      data: null,
    };
  }
}
