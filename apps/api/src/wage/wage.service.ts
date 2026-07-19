import { Injectable } from "@nestjs/common";

import { BusyDateRange } from "src/_common/dtos/response/busy-days.response.dto";
import { WageNotFoundException } from "src/_common/exceptions/wage.exception";
import { generateDateOverlapClause } from "src/_common/utils/generator/generate-date-overlap-clause";
import { PrismaService } from "src/prisma/prisma.service";

import { CreateWageRequest } from "./dtos/create-wage.request.dto";
import { UpdateWageRequest } from "./dtos/update-wage.request.dto";
import { WageFilterParam } from "./dtos/wage-filter.param.dto";
import { WageResponse } from "./dtos/wage.response.dto";

@Injectable()
export class WageService {
  constructor(private readonly prismaService: PrismaService) {}

  async findWagesByCurrentUser(
    currentUserId: string,
    filter: WageFilterParam,
  ): Promise<WageResponse[]> {
    const dateFilterClause = generateDateOverlapClause(filter);

    return this.prismaService.wage.findMany({
      where: {
        createdByUserId: currentUserId,
        ...dateFilterClause,
        ...(filter?.status && { status: filter.status }),
      },
      orderBy: { createdAt: "desc" },
      include: { createdBy: true },
    });
  }

  async findBusyDaysByCurrentUser(
    currentUserId: string,
  ): Promise<BusyDateRange[]> {
    return this.prismaService.wage.findMany({
      // Fetch every wage date-range owned by the current user
      // return type is [{ startDate: Date, endDate: Date }, ...]
      // Example: 
      // [
      //  { startDate: 2026-04-30T01:00:00Z, endDate: 2026-05-02T11:00:00Z }, // each represent a busy date range of a wage
      //  { startDate: 2026-07-10T00:00:00Z, endDate: 2026-07-12T00:00:00Z },
      //]
      where: { createdByUserId: currentUserId },
      select: { startDate: true, endDate: true },
    });
  }

  async findWageById(id: string): Promise<WageResponse> {
    const wage = await this.prismaService.wage.findUnique({
      where: { id },
      include: { createdBy: true },
    });

    if (!wage) throw new WageNotFoundException();

    return wage;
  }

  async createWage(
    createWageReq: CreateWageRequest,
    currentUserId: string,
  ): Promise<WageResponse> {
    return this.prismaService.wage.create({
      data: {
        ...createWageReq,
        createdByUserId: currentUserId,
        status: "PROCESSING",
      },
      include: { createdBy: true },
    });
  }

  async updateWage(
    id: string,
    updateWageReq: UpdateWageRequest,
  ): Promise<WageResponse> {
    const existing = await this.prismaService.wage.findUnique({
      where: { id },
    });

    if (!existing) throw new WageNotFoundException();

    return this.prismaService.wage.update({
      where: { id },
      data: updateWageReq,
      include: { createdBy: true },
    });
  }

  async deleteWageById(id: string): Promise<void> {
    const existing = await this.prismaService.wage.findUnique({
      where: { id },
    });

    if (!existing) throw new WageNotFoundException();

    await this.prismaService.wage.delete({ where: { id } });
  }
}
