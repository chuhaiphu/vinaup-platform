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

import type { AuthenticatedRequest, HttpResponse } from 'src/_common/interfaces/interface';
import { JwtAuthGuard } from 'src/_core/guards/jwt-auth.guard';

import { CreateProjectCategoryRequest } from '../dtos/create-project-category.request.dto';
import { ProjectCategoryResponse } from '../dtos/project-category.response.dto';
import { UpdateProjectCategoryRequest } from '../dtos/update-project-category.request.dto';
import { ProjectCategoryService } from '../services/project-category.service';

@Controller('project-category')
export class ProjectCategoryController {
  constructor(private readonly projectCategoryService: ProjectCategoryService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findByCurrentUser(
    @Request() req: AuthenticatedRequest,
  ): Promise<HttpResponse<ProjectCategoryResponse[]>> {
    const data = await this.projectCategoryService.findCategoriesByCurrentUser(req.user.userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Project categories retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/organization/:organizationId')
  async findByOrganizationId(
    @Param('organizationId') organizationId: string,
  ): Promise<HttpResponse<ProjectCategoryResponse[]>> {
    const data = await this.projectCategoryService.findCategoriesByOrganizationId(organizationId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Project categories retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('/')
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createReq: CreateProjectCategoryRequest,
  ): Promise<HttpResponse<ProjectCategoryResponse>> {
    const data = await this.projectCategoryService.createCategory(createReq, req.user.userId);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Project category created successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async findById(@Param('id') id: string): Promise<HttpResponse<ProjectCategoryResponse>> {
    const data = await this.projectCategoryService.findCategoryById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Project category retrieved successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateReq: UpdateProjectCategoryRequest,
  ): Promise<HttpResponse<ProjectCategoryResponse>> {
    const data = await this.projectCategoryService.updateCategory(id, updateReq);
    return {
      statusCode: HttpStatus.OK,
      message: 'Project category updated successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async delete(@Param('id') id: string): Promise<HttpResponse<null>> {
    await this.projectCategoryService.deleteCategoryById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Project category deleted successfully',
      data: null,
    };
  }
}
