import { Injectable } from "@nestjs/common";
import type {
  CreateWageRequestInterface,
  UpdateWageRequestInterface,
  WageFilterRequestInterface,
} from '@vinaup-platform/validation';

import { BusyDateRange } from "src/_common/dtos/response/busy-days.response.dto";
import { WageNotFoundException } from "src/_common/exceptions/wage.exception";
import { generateDateOverlapClause } from "src/_common/utils/generator/generate-date-overlap-clause";
import { PrismaService } from "src/prisma/prisma.service";

import { wageQueryArgs, type WageResponse } from "./dtos/wage.response.dto";

@Injectable()
export class WageService {
  constructor(private readonly prismaService: PrismaService) {}

  async findWagesByCurrentUser(
    currentUserId: string,
    filter: WageFilterRequestInterface,
  ): Promise<WageResponse[]> {
    const dateFilterClause = generateDateOverlapClause(filter);

    return this.prismaService.wage.findMany({
      where: {
        createdByUserId: currentUserId,
        ...dateFilterClause,
        ...(filter?.status && { status: filter.status }),
      },
      orderBy: { createdAt: "desc" },
      ...wageQueryArgs,
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
      ...wageQueryArgs,
    });

    if (!wage) throw new WageNotFoundException();

    return wage;
  }

  async createWage(
    createWageReq: CreateWageRequestInterface,
    currentUserId: string,
  ): Promise<WageResponse> {
    return this.prismaService.wage.create({
      data: {
        ...createWageReq,
        createdByUserId: currentUserId,
        status: "PROCESSING",
      },
      ...wageQueryArgs,
    });
  }

  async updateWage(
    id: string,
    updateWageReq: UpdateWageRequestInterface,
  ): Promise<WageResponse> {
    const existing = await this.prismaService.wage.findUnique({
      where: { id },
    });

    if (!existing) throw new WageNotFoundException();

    return this.prismaService.wage.update({
      where: { id },
      data: updateWageReq,
      ...wageQueryArgs,
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
