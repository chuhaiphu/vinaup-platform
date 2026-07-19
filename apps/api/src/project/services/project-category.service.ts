import { Injectable } from '@nestjs/common';
import type {
  CreateProjectCategoryRequestInterface,
  UpdateProjectCategoryRequestInterface,
} from '@vinaup-platform/validation';

import { ProjectCategoryNotFoundException } from 'src/_common/exceptions/project.exception';
import { PrismaService } from 'src/prisma/prisma.service';

import { projectCategoryQueryArgs, type ProjectCategoryResponse } from '../dtos/project-category.response.dto';

@Injectable()
export class ProjectCategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async findCategoriesByCurrentUser(userId: string): Promise<ProjectCategoryResponse[]> {
    return this.prismaService.projectCategory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      ...projectCategoryQueryArgs,
    });
  }

  async findCategoriesByOrganizationId(organizationId: string): Promise<ProjectCategoryResponse[]> {
    return this.prismaService.projectCategory.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      ...projectCategoryQueryArgs,
    });
  }

  async findCategoryById(id: string): Promise<ProjectCategoryResponse> {
    const category = await this.prismaService.projectCategory.findUnique({
      where: { id },
      ...projectCategoryQueryArgs,
    });

    if (!category) {
      throw new ProjectCategoryNotFoundException();
    }

    return category;
  }

  async createCategory(
    createReq: CreateProjectCategoryRequestInterface,
    currentUserId: string,
  ): Promise<ProjectCategoryResponse> {
    const { organizationId, ...rest } = createReq;

    return this.prismaService.projectCategory.create({
      data: {
        ...rest,
        ...(organizationId ? { organizationId } : { userId: currentUserId }),
      },
      ...projectCategoryQueryArgs,
    });
  }

  async updateCategory(
    id: string,
    updateReq: UpdateProjectCategoryRequestInterface,
  ): Promise<ProjectCategoryResponse> {
    const existing = await this.prismaService.projectCategory.findUnique({ where: { id } });

    if (!existing) {
      throw new ProjectCategoryNotFoundException();
    }

    return this.prismaService.projectCategory.update({
      where: { id },
      data: updateReq,
      ...projectCategoryQueryArgs,
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
