import { Injectable } from "@nestjs/common";
import type {
  CreateProjectRequestInterface,
  ProjectFilterRequestInterface,
  UpdateProjectRequestInterface,
} from '@vinaup-platform/validation';

import { BusyDateRange } from "src/_common/dtos/response/busy-days.response.dto";
import { ProjectNotFoundException } from "src/_common/exceptions/project.exception";
import { generateDateOverlapClause } from "src/_common/utils/generator/generate-date-overlap-clause";
import { PrismaService } from "src/prisma/prisma.service";
import { StorageService } from 'src/storage/storage.service';

import { toProjectResponse, projectQueryArgs, type ProjectResponse } from "../dtos/project.response.dto";


@Injectable()
export class ProjectService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async findProjectsByCurrentUser(
    currentUserId: string,
    filter: ProjectFilterRequestInterface,
  ): Promise<ProjectResponse[]> {
    const dateFilterClause = generateDateOverlapClause(filter);

    const projects = await this.prismaService.project.findMany({
      where: {
        createdByUserId: currentUserId,
        ...dateFilterClause,
        ...(filter?.type && {
          type: { contains: filter.type, mode: "insensitive" },
        }),
        ...(filter?.status && { status: filter.status }),
        ...(filter?.categoryId && { categoryId: filter.categoryId }),
      },
      orderBy: { createdAt: "desc" },
      ...projectQueryArgs,
    });
    return projects.map((row) => toProjectResponse(row, this.storageService));
  }

  async findProjectsByOrganizationId(
    organizationId: string,
    filter: ProjectFilterRequestInterface,
  ): Promise<ProjectResponse[]> {
    const dateFilterClause = generateDateOverlapClause(filter);

    const projects = await this.prismaService.project.findMany({
      where: {
        organizationId: organizationId,
        ...dateFilterClause,
        ...(filter?.type && {
          type: { contains: filter.type, mode: "insensitive" },
        }),
        ...(filter?.status && { status: filter.status }),
        ...(filter?.categoryId && { categoryId: filter.categoryId }),
      },
      orderBy: { createdAt: "desc" },
      ...projectQueryArgs,
    });

    return projects.map((row) => toProjectResponse(row, this.storageService));
  }

  async findBusyDaysByCurrentUser(
    currentUserId: string,
  ): Promise<BusyDateRange[]> {
    // Fetch every project date-range owned by the current user
    // return type is [{ startDate: Date, endDate: Date }, ...]
    // Example:
    // [
    //  { startDate: 2026-04-30T01:00:00Z, endDate: 2026-05-02T11:00:00Z }, // each represent a busy date range of a project
    //  { startDate: 2026-07-10T00:00:00Z, endDate: 2026-07-12T00:00:00Z },
    //]
    return this.prismaService.project.findMany({
      where: { createdByUserId: currentUserId },
      select: { startDate: true, endDate: true },
    });
  }

  async createProject(
    createProjectReq: CreateProjectRequestInterface,
    currentUserId: string,
  ): Promise<ProjectResponse> {
    const newProject = await this.prismaService.project.create({
      data: {
        ...createProjectReq,
        createdByUserId: currentUserId,
        status: "PROCESSING",
      },
      ...projectQueryArgs,
    });
    return toProjectResponse(newProject, this.storageService);
  }

  async updateProject(
    id: string,
    updateProjectReq: UpdateProjectRequestInterface,
  ): Promise<ProjectResponse> {
    const existingProject = await this.prismaService.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      throw new ProjectNotFoundException();
    }

    const updatedProject = await this.prismaService.project.update({
      where: { id },
      data: updateProjectReq,
      ...projectQueryArgs,
    });
    return toProjectResponse(updatedProject, this.storageService);
  }

  async deleteProjectById(id: string): Promise<void> {
    const existingProject = await this.prismaService.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      throw new ProjectNotFoundException();
    }

    await this.prismaService.project.delete({
      where: { id },
    });
  }

  async findProjectById(id: string): Promise<ProjectResponse> {
    const project = await this.prismaService.project.findUnique({
      where: { id },
      ...projectQueryArgs,
    });

    if (!project) {
      throw new ProjectNotFoundException();
    }

    return toProjectResponse(project, this.storageService);
  }
}
