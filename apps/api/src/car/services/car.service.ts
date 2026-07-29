import { Injectable } from '@nestjs/common';
import {
  TRIP_STATUS,
  type CarFilterRequestInterface,
  type CreateCarRequestInterface,
  type UpdateCarRequestInterface,
} from '@vinaup-platform/validation';

import { CAR_OPERATIONAL_STATUS } from 'src/_common/constants/car.constant';
import { CarNotFoundException } from 'src/_common/exceptions/car.exception';
import { OrganizationNotFoundException } from 'src/_common/exceptions/organization.exception';
import { generateDateOverlapClause } from 'src/_common/utils/generator/generate-date-overlap-clause';
import { PrismaService } from 'src/prisma/prisma.service';

import {
  carQueryArgs,
  carTripAssignmentQueryArgs,
  type CarResponse,
  type CarWithMeta,
} from '../dtos/car.response.dto';

@Injectable()
export class CarService {
  constructor(private readonly prismaService: PrismaService) {}

  private buildCarIncludeClause(filter?: CarFilterRequestInterface) {
    const nowIso = new Date().toISOString();
    const selectedDate =
      filter?.startDate && filter?.endDate
        ? { startDate: filter.startDate, endDate: filter.endDate }
        : { startDate: nowIso, endDate: nowIso };

    return {
      ...carQueryArgs.include,
      tripAssignments: {
        ...carTripAssignmentQueryArgs,
        where: {
          trip: {
            status: { not: TRIP_STATUS.CANCELLED }, // a cancelled trip freed its car
            ...generateDateOverlapClause(selectedDate),
          },
        },
        orderBy: { trip: { startDate: 'asc' as const } },
      },
    };
  }

  async findCarsByOrganizationId(organizationId: string, filter?: CarFilterRequestInterface): Promise<CarWithMeta[]> {
    const whereClause = {
      organizationId,
      ...(filter?.name && { name: { contains: filter.name, mode: 'insensitive' as const } }),
      ...(filter?.status && { status: filter.status }),
      ...(filter?.category && { category: filter.category }),
      ...(filter?.fuelType && { fuelType: filter.fuelType }),
    };

    const cars = await this.prismaService.car.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: this.buildCarIncludeClause(filter),
    });

    return cars.map((car) => this.attachMeta(car));
  }

  async findCarById(id: string): Promise<CarWithMeta> {
    const car = await this.prismaService.car.findUnique({
      where: { id },
      // No day to view on a detail screen, so the lens falls back to right now.
      include: this.buildCarIncludeClause(),
    });

    if (!car) {
      throw new CarNotFoundException();
    }

    return this.attachMeta(car);
  }

  private async assertOrganizationExists(organizationId: string): Promise<void> {
    const organization = await this.prismaService.organization.findUnique({
      where: { id: organizationId },
      select: { id: true },
    });
    if (!organization) throw new OrganizationNotFoundException();
  }

  async createCar(createCarReq: CreateCarRequestInterface, currentUserId: string): Promise<CarWithMeta> {
    await this.assertOrganizationExists(createCarReq.organizationId);

    // ─── Create car + its maintenance log in a single transaction ───────
    // CarMaintenanceLog is the container for all maintenance receipt payments.
    // It is always created together with the car (1-1 relationship).
    const car = await this.prismaService.car.create({
      data: {
        ...createCarReq,
        createdByUserId: currentUserId,
        additionalImageUrls: createCarReq.additionalImageUrls || [],
        carMaintenanceLog: {
          create: {},
        },
      },
      include: this.buildCarIncludeClause(),
    });

    return this.attachMeta(car);
  }

  async updateCar(id: string, updateCarReq: UpdateCarRequestInterface): Promise<CarWithMeta> {
    const existingCar = await this.prismaService.car.findUnique({
      where: { id },
    });

    if (!existingCar) {
      throw new CarNotFoundException();
    }

    const car = await this.prismaService.car.update({
      where: { id },
      data: {
        ...updateCarReq,
      },
      include: this.buildCarIncludeClause(),
    });

    return this.attachMeta(car);
  }

  async deleteCarById(id: string): Promise<void> {
    const existingCar = await this.prismaService.car.findUnique({
      where: { id },
    });

    if (!existingCar) {
      throw new CarNotFoundException();
    }

    await this.prismaService.car.delete({ where: { id } });
  }

  // ─── Expiring cars: any expiry date within threshold or already expired ─────
  // Used by the frontend to show in-app warnings on login.
  // A car appears if ANY of its four expiry dates is ≤ (now + thresholdDays).
  // Cars with null expiry dates are excluded (no date = nothing to warn about).
  async findExpiringCars(organizationId: string, thresholdDays: number = 30): Promise<CarWithMeta[]> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + thresholdDays);

    const cars = await this.prismaService.car.findMany({
      where: {
        organizationId,
        OR: [
          { inspectionExpiryDate: { lte: thresholdDate } },
          { roadFeeExpiryDate: { lte: thresholdDate } },
          { insuranceExpiryDate: { lte: thresholdDate } },
          { badgeExpiryDate: { lte: thresholdDate } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: this.buildCarIncludeClause(),
    });

    return cars.map((car) => this.attachMeta(car));
  }

  private attachMeta(currentCar: CarResponse): CarWithMeta {
    return {
      ...currentCar,
      meta: {
        canEdit: true, // no per-record edit lock; authorization is the route guard's job
        operationalStatus: currentCar.tripAssignments.length
          ? CAR_OPERATIONAL_STATUS.OPERATING
          : CAR_OPERATIONAL_STATUS.RESTING,
      },
    };
  }
}
