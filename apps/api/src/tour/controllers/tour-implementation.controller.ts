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

import { TOUR_TARGET_RESOURCE } from 'src/_common/constants/tour.constant';
import type {
  AuthenticatedRequest,
  HttpResponse,
} from 'src/_common/interfaces/interface';
import { CheckTourImplementationAccess } from 'src/_core/decorators/tour-implementation-access.decorator';
import { JwtAuthGuard } from 'src/_core/guards/jwt-auth.guard';
import { TourImplementationAccessGuard } from 'src/_core/guards/tour-implementation-access.guard';

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

  @UseGuards(JwtAuthGuard, TourImplementationAccessGuard)
  @CheckTourImplementationAccess({ source: 'param', idKey: 'id', targetResource: TOUR_TARGET_RESOURCE.TOUR_IMPLEMENTATION })
  @Post('/:id/members-assigned')
  async manageMembersAssigned(
    @Param('id') id: string,
    @Body() body: ManageMembersAssignedRequest
  ): Promise<HttpResponse<MemberAssignedTourImplementationResponse[]>> {
    const data = await this.tourImplementationService.manageMembersAssigned(
      id,
      body
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Members assigned managed successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard, TourImplementationAccessGuard)
  @CheckTourImplementationAccess({ source: 'param', idKey: 'id', targetResource: TOUR_TARGET_RESOURCE.TOUR_IMPLEMENTATION })
  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateTourImplementationRequest
  ): Promise<HttpResponse<TourImplementationResponse>> {
    const data = await this.tourImplementationService.updateTourImplementation(
      id,
      body
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Tour implementation updated successfully',
      data,
    };
  }
}
