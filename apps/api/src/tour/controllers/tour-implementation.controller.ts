import {
  Body,
  Controller,
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

import { ManageMembersAssignedRequest } from '../dtos/manage-members-assigned.request.dto';
import type { MemberAssignedTourImplementationResponse, MemberAssignedTourImplementationWithMeta } from '../dtos/member-assigned-tour-implementation.response.dto';
import type { TourImplementationResponse, TourImplementationWithMeta } from '../dtos/tour-implementation.response.dto';
import { UpdateTourImplementationRequest } from '../dtos/update-tour-implementation.request.dto';
import { TourImplementationService } from '../services/tour-implementation.service';

@Controller('tour-implementation')
export class TourImplementationController {
  constructor(
    private readonly tourImplementationService: TourImplementationService
  ) { }

  // Static segments must come before dynamic /:id to avoid routing conflicts

  @UseGuards(JwtAuthGuard)
  @Get('/by-tour/:tourId')
  async findByTourId(
    @Request() req: AuthenticatedRequest,
    @Param('tourId') tourId: string
  ): Promise<HttpResponse<TourImplementationWithMeta>> {
    const data =
      await this.tourImplementationService.findTourImplementationByTourId(
        tourId,
        req.user.userId
      );

    return {
      statusCode: HttpStatus.OK,
      message: 'Tour implementation retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id/members-assigned')
  async getMembersAssigned(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string
  ): Promise<HttpResponse<MemberAssignedTourImplementationWithMeta[]>> {
    const data =
      await this.tourImplementationService.getMembersAssignedByTourImplementationId(
        id,
        req.user.userId
      );

    return {
      statusCode: HttpStatus.OK,
      message: 'Members assigned retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard, OrganizationTourImplementationMutationGuard)
  @Post('/:id/members-assigned')
  async manageMembersAssigned(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: ManageMembersAssignedRequest
  ): Promise<HttpResponse<MemberAssignedTourImplementationResponse[]>> {
    const data = await this.tourImplementationService.manageMembersAssigned(
      id,
      body,
      req.user.userId
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Members assigned managed successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard, OrganizationTourImplementationMutationGuard)
  @Put('/:id')
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: UpdateTourImplementationRequest
  ): Promise<HttpResponse<TourImplementationResponse>> {
    const data = await this.tourImplementationService.updateTourImplementation(
      id,
      body,
      req.user.userId
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Tour implementation updated successfully',
      data,
    };
  }
}
