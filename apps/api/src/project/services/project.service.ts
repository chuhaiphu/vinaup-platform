import { Injectable } from "@nestjs/common";

import { BusyDateRange } from "src/_common/dtos/response/busy-days.response.dto";
import { ProjectNotFoundException } from "src/_common/exceptions/project.exception";
import { generateDateOverlapClause } from "src/_common/utils/generator/generate-date-overlap-clause";
import { PrismaService } from "src/prisma/prisma.service";

import { CreateProjectRequest } from "../dtos/create-project.request.dto";
import { ProjectFilterParam } from "../dtos/project-filter.param.dto";
import { ProjectResponse } from "../dtos/project.response.dto";
import { UpdateProjectRequest } from "../dtos/update-project.request.dto";


@Injectable()
export class ProjectService {
  constructor(private readonly prismaService: PrismaService) {}

  async findProjectsByCurrentUser(
    currentUserId: string,
    filter: ProjectFilterParam,
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
      include: {
        createdBy: true,
        organization: true,
        organizationCustomer: true,
        category: true,
      },
    });
    return projects;
  }

  async findProjectsByOrganizationId(
    organizationId: string,
    filter: ProjectFilterParam,
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
      include: {
        createdBy: true,
        organization: true,
        organizationCustomer: true,
        category: true,
      },
    });

    return projects;
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
    createProjectReq: CreateProjectRequest,
    currentUserId: string,
  ): Promise<ProjectResponse> {
    const newProject = await this.prismaService.project.create({
      data: {
        ...createProjectReq,
        createdByUserId: currentUserId,
        status: "PROCESSING",
      },
      include: {
        createdBy: true,
        organization: true,
        organizationCustomer: true,
        category: true,
      },
    });
    return newProject;
  }

  async updateProject(
    id: string,
    updateProjectReq: UpdateProjectRequest,
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
      include: {
        createdBy: true,
        organization: true,
        organizationCustomer: true,
        category: true,
      },
    });
    return updatedProject;
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
      include: {
        createdBy: true,
        organization: true,
        organizationCustomer: true,
        category: true,
      },
    });

    if (!project) {
      throw new ProjectNotFoundException();
    }

    return project;
  }
}
