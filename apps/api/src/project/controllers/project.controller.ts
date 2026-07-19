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
import type {
  AuthenticatedRequest,
  HttpResponse,
} from 'src/_common/interfaces/interface';
import { JwtAuthGuard } from 'src/_core/guards/jwt-auth.guard';
import { OrganizationProjectMutationGuard } from 'src/_core/guards/organization-project-mutation.guard';

import { CreateProjectRequest } from '../dtos/create-project.request.dto';
import { ProjectFilterParam } from '../dtos/project-filter.param.dto';
import { ProjectResponse } from '../dtos/project.response.dto';
import { UpdateProjectRequest } from '../dtos/update-project.request.dto';
import { ProjectService } from '../services/project.service';


@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findByCurrentUser(
    @Request() req: AuthenticatedRequest,
    @Query() filter: ProjectFilterParam
  ): Promise<HttpResponse<ProjectResponse[]>> {
    const data = await this.projectService.findProjectsByCurrentUser(
      req.user.userId,
      filter
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Projects retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/organization/:organizationId')
  async findByOrganizationId(
    @Param('organizationId') organizationId: string,
    @Query() filter: ProjectFilterParam
  ): Promise<HttpResponse<ProjectResponse[]>> {
    const data = await this.projectService.findProjectsByOrganizationId(
      organizationId,
      filter
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Projects retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('/')
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createProjectReq: CreateProjectRequest
  ): Promise<HttpResponse<ProjectResponse>> {
    const data = await this.projectService.createProject(
      createProjectReq,
      req.user.userId
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Project created successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('busy-days')
  async findBusyDays(
    @Request() req: AuthenticatedRequest,
  ): Promise<HttpResponse<BusyDateRange[]>> {
    const data = await this.projectService.findBusyDaysByCurrentUser(
      req.user.userId,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Project busy days retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async findById(@Param('id') id: string): Promise<HttpResponse<ProjectResponse>> {
    const data = await this.projectService.findProjectById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Project retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard, OrganizationProjectMutationGuard)
  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateProjectReq: UpdateProjectRequest
  ): Promise<HttpResponse<ProjectResponse>> {
    const data = await this.projectService.updateProject(id, updateProjectReq);
    return {
      statusCode: HttpStatus.OK,
      message: 'Project updated successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard, OrganizationProjectMutationGuard)
  @Delete('/:id')
  async delete(@Param('id') id: string): Promise<HttpResponse<null>> {
    await this.projectService.deleteProjectById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Project deleted successfully',
      data: null,
    };
  }
}
