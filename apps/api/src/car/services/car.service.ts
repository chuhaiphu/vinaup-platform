import { Injectable } from '@nestjs/common';
import { TRIP_STATUS } from '@vinaup-platform/validation';

import { CAR_OPERATIONAL_STATUS } from 'src/_common/constants/car.constant';
import { CarNotFoundException } from 'src/_common/exceptions/car.exception';
import { generateDateOverlapClause } from 'src/_common/utils/generator/generate-date-overlap-clause';
import { PrismaService } from 'src/prisma/prisma.service';

import { CarFilterParam } from '../dtos/car-filter.param.dto';
import { CarResponse, CarWithMeta } from '../dtos/car.response.dto';
import { CreateCarRequest } from '../dtos/create-car.request.dto';
import { UpdateCarRequest } from '../dtos/update-car.request.dto';

@Injectable()
export class CarService {
  constructor(private readonly prismaService: PrismaService) {}

  async findCarsByOrganizationId(organizationId: string, filter?: CarFilterParam): Promise<CarWithMeta[]> {
    const dateFilterClause = (() => {
      if (!filter?.startDate || !filter?.endDate) return {};
      // ─── Filter by trip usage in the period, not by car.createdAt ─────
      // Return a car in at least one trip assignment whose trip's [startDate, endDate] overlaps the filter range.
      return {
        tripAssignments: {
          some: {
            trip: generateDateOverlapClause(filter),
          },
        },
      };
    })();

    const whereClause = {
      organizationId,
      ...(filter?.name && { name: { contains: filter.name, mode: 'insensitive' as const } }),
      ...(filter?.status && { status: filter.status }),
      ...(filter?.category && { category: filter.category }),
      ...(filter?.fuelType && { fuelType: filter.fuelType }),
      ...dateFilterClause,
    };

    const cars = await this.prismaService.car.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: true,
        organization: true,
        carAssignments: {
          include: {
            organizationMember: {
              include: { user: true },
            },
          },
        },
        carMaintenanceLog: true,
      },
    });

    const assignedCarIdSet = await this.findAssignedCarIdSet(cars.map((car) => car.id));
    return cars.map((car) => this.attachMeta(car, assignedCarIdSet));
  }

  async findCarById(id: string): Promise<CarWithMeta> {
    const car = await this.prismaService.car.findUnique({
      where: { id },
      include: {
        createdBy: true,
        organization: true,
        carAssignments: {
          include: {
            organizationMember: {
              include: { user: true },
            },
          },
        },
        carMaintenanceLog: true,
      },
    });

    if (!car) {
      throw new CarNotFoundException();
    }

    const assignedCarIdSet = await this.findAssignedCarIdSet([car.id]);
    return this.attachMeta(car, assignedCarIdSet);
  }

  async createCar(createCarReq: CreateCarRequest, currentUserId: string): Promise<CarWithMeta> {
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
      include: {
        createdBy: true,
        organization: true,
        carAssignments: true,
        carMaintenanceLog: true,
      },
    });

    // A brand-new car has no trip assignments yet, so it is always RESTING — skip the query.
    return this.attachMeta(car, new Set());
  }

  async updateCar(id: string, updateCarReq: UpdateCarRequest): Promise<CarWithMeta> {
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
      include: {
        createdBy: true,
        organization: true,
        carAssignments: true,
        carMaintenanceLog: true,
      },
    });

    const assignedCarIdSet = await this.findAssignedCarIdSet([car.id]);
    return this.attachMeta(car, assignedCarIdSet);
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
      include: {
        createdBy: true,
        organization: true,
        carAssignments: {
          include: {
            organizationMember: {
              include: { user: true },
            },
          },
        },
      },
    });

    const assignedCarIdSet = await this.findAssignedCarIdSet(cars.map((car) => car.id));
    return cars.map((car) => this.attachMeta(car, assignedCarIdSet));
  }

  // Batched into one query (returns only the running ids) to avoid an N+1 per car.
  // Returns a Set, not an array, because Set.has is O(1),
  // so N cars cost O(N) lookup total instead of O(N·M) with Array.includes.
  private async findAssignedCarIdSet(carIdList: string[]): Promise<Set<string>> {
    if (!carIdList.length) return new Set();

    const runningTripAssignments = await this.prismaService.tripAssignment.findMany({
      where: {
        carId: { in: carIdList },
        trip: {
          status: { not: TRIP_STATUS.CANCELLED }, // a cancelled trip freed its car
          ...generateDateOverlapClause({
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString(),
          }),
        },
      },
      select: { carId: true },
    });

    return new Set(
      runningTripAssignments
        .map((tripAssignment) => tripAssignment.carId)
        .filter((carId) => carId !== null),
    );
  }

  private attachMeta(currentCar: CarResponse, assignedCarIdSet: Set<string>): CarWithMeta {
    return {
      ...currentCar,
      meta: {
        canEdit: true, // no per-record edit lock; authorization is the route guard's job
        operationalStatus: assignedCarIdSet.has(currentCar.id)
          ? CAR_OPERATIONAL_STATUS.OPERATING
          : CAR_OPERATIONAL_STATUS.RESTING,
      },
    };
  }
}
