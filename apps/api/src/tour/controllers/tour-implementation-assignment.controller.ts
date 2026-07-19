import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';

import type {
  AuthenticatedRequest,
  HttpResponse,
} from 'src/_common/interfaces/interface';
import { JwtAuthGuard } from 'src/_core/guards/jwt-auth.guard';
import { OrganizationTourImplementationMutationGuard } from 'src/_core/guards/organization-tour-implementation-mutation.guard';

import { CreateUserAssignedRequest } from '../dtos/create-user-assigned.request.dto';
import type { TourImplementationAssignmentWithMeta } from '../dtos/tour-implementation-assignment.response.dto';
import { UpdateTourImplementationAssignmentRequest } from '../dtos/update-tour-implementation-assignment.request.dto';
import { UpdateUserAssignedRequest } from '../dtos/update-user-assigned.request.dto';
import type { UserAssignedTourImplementationResponse } from '../dtos/user-assigned-tour-implementation.response.dto';
import { TourImplementationAssignmentService } from '../services/tour-implementation-assignment.service';

@Controller('tour-implementation-assignment')
export class TourImplementationAssignmentController {
  constructor(
    private readonly tourImplementationAssignmentService: TourImplementationAssignmentService
  ) { }

  // Static segments must come before dynamic /:id to avoid routing conflicts

  @UseGuards(JwtAuthGuard)
  @Post('/users-assigned')
  async addUserAssigned(
    @Body() body: CreateUserAssignedRequest
  ): Promise<HttpResponse<UserAssignedTourImplementationResponse>> {
    const data =
      await this.tourImplementationAssignmentService.addUserAssignedToTourImplementation(body);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'User assigned added successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('/users-assigned/:userAssignedId')
  async updateUserAssigned(
    @Param('userAssignedId') userAssignedId: string,
    @Body() body: UpdateUserAssignedRequest
  ): Promise<HttpResponse<UserAssignedTourImplementationResponse>> {
    const data =
      await this.tourImplementationAssignmentService.updateUserAssignedToTourImplementation(
        userAssignedId,
        body
      );

    return {
      statusCode: HttpStatus.OK,
      message: 'User assigned updated successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/users-assigned/:userAssignedId')
  async removeUserAssigned(
    @Request() req: AuthenticatedRequest,
    @Param('userAssignedId') userAssignedId: string
  ): Promise<HttpResponse<null>> {
    await this.tourImplementationAssignmentService.removeUserAssignedFromTourImplementation(
      userAssignedId,
      req.user.userId
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'User assigned removed successfully',
      data: null,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/tour-implementation/:tourImplementationId')
  async getAssignments(
    @Request() req: AuthenticatedRequest,
    @Param('tourImplementationId') tourImplementationId: string
  ): Promise<HttpResponse<TourImplementationAssignmentWithMeta[]>> {
    const data =
      await this.tourImplementationAssignmentService.getAssignmentsByTourImplementationId(
        tourImplementationId,
        req.user.userId
      );

    return {
      statusCode: HttpStatus.OK,
      message: 'Assignments retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard, OrganizationTourImplementationMutationGuard)
  @Post('/tour-implementation/:id')
  async createAssignment(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string
  ): Promise<HttpResponse<TourImplementationAssignmentWithMeta>> {
    const data =
      await this.tourImplementationAssignmentService.createTourImplementationAssignment(
        id,
        req.user.userId
      );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Assignment created successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async updateAssignment(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: UpdateTourImplementationAssignmentRequest
  ): Promise<HttpResponse<TourImplementationAssignmentWithMeta>> {
    const data =
      await this.tourImplementationAssignmentService.updateTourImplementationAssignment(
        id,
        body,
        req.user.userId
      );

    return {
      statusCode: HttpStatus.OK,
      message: 'Assignment updated successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async deleteAssignment(
    @Param('id') id: string
  ): Promise<HttpResponse<null>> {
    await this.tourImplementationAssignmentService.deleteTourImplementationAssignment(
      id
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Assignment deleted successfully',
      data: null,
    };
  }
}
