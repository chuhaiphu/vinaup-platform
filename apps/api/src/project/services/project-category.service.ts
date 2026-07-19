import { Injectable } from '@nestjs/common';

import { ProjectCategoryNotFoundException } from 'src/_common/exceptions/project.exception';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreateProjectCategoryRequest } from '../dtos/create-project-category.request.dto';
import { ProjectCategoryResponse } from '../dtos/project-category.response.dto';
import { UpdateProjectCategoryRequest } from '../dtos/update-project-category.request.dto';

@Injectable()
export class ProjectCategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async findCategoriesByCurrentUser(userId: string): Promise<ProjectCategoryResponse[]> {
    return this.prismaService.projectCategory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { projects: true },
    });
  }

  async findCategoriesByOrganizationId(organizationId: string): Promise<ProjectCategoryResponse[]> {
    return this.prismaService.projectCategory.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      include: { projects: true },
    });
  }

  async findCategoryById(id: string): Promise<ProjectCategoryResponse> {
    const category = await this.prismaService.projectCategory.findUnique({
      where: { id },
      include: { projects: true },
    });

    if (!category) {
      throw new ProjectCategoryNotFoundException();
    }

    return category;
  }

  async createCategory(
    createReq: CreateProjectCategoryRequest,
    currentUserId: string,
  ): Promise<ProjectCategoryResponse> {
    const { organizationId, ...rest } = createReq;

    return this.prismaService.projectCategory.create({
      data: {
        ...rest,
        ...(organizationId ? { organizationId } : { userId: currentUserId }),
      },
      include: { projects: true },
    });
  }

  async updateCategory(
    id: string,
    updateReq: UpdateProjectCategoryRequest,
  ): Promise<ProjectCategoryResponse> {
    const existing = await this.prismaService.projectCategory.findUnique({ where: { id } });

    if (!existing) {
      throw new ProjectCategoryNotFoundException();
    }

    return this.prismaService.projectCategory.update({
      where: { id },
      data: updateReq,
      include: { projects: true },
    });
  }

  async deleteCategoryById(id: string): Promise<void> {
    const existing = await this.prismaService.projectCategory.findUnique({ where: { id } });

    if (!existing) {
      throw new ProjectCategoryNotFoundException();
    }

    await this.prismaService.projectCategory.delete({ where: { id } });
  }
}
