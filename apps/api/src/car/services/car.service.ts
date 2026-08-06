import { Injectable } from '@nestjs/common';
import {
  TRIP_STATUS,
  type CarFilterRequestInterface,
  type CreateCarRequestInterface,
  type UpdateCarRequestInterface,
} from '@vinaup-platform/validation';

import { CAR_OPERATIONAL_STATUS } from 'src/_common/constants/car.constant';
import { EXTENSION_BY_MIME } from 'src/_common/constants/storage.constant';
import { CarNotFoundException } from 'src/_common/exceptions/car.exception';
import { OrganizationNotFoundException } from 'src/_common/exceptions/organization.exception';
import { UploadFailedException } from 'src/_common/exceptions/storage.exception';
import { generateDateOverlapClause } from 'src/_common/utils/generator/generate-date-overlap-clause';
import { PrismaService } from 'src/prisma/prisma.service';
import { StorageService } from 'src/storage/storage.service';

import {
  carQueryArgs,
  carTripAssignmentQueryArgs,
  toCarResponse,
  type CarResponse,
  type CarWithMeta,
} from '../dtos/car.response.dto';

@Injectable()
export class CarService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  private buildCarSelectClause(filter?: CarFilterRequestInterface) {
    const nowIso = new Date().toISOString();
    const selectedDate =
      filter?.startDate && filter?.endDate
        ? { startDate: filter.startDate, endDate: filter.endDate }
        : { startDate: nowIso, endDate: nowIso };

    return {
      ...carQueryArgs.select,
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
      select: this.buildCarSelectClause(filter),
    });

    return cars.map((car) => this.attachMeta(toCarResponse(car, this.storageService)));
  }

  async findCarById(id: string): Promise<CarWithMeta> {
    const car = await this.prismaService.car.findUnique({
      where: { id },
      // No day to view on a detail screen, so the lens falls back to right now.
      select: this.buildCarSelectClause(),
    });

    if (!car) {
      throw new CarNotFoundException();
    }

    return this.attachMeta(toCarResponse(car, this.storageService));
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
        carMaintenanceLog: {
          create: {},
        },
      },
      select: this.buildCarSelectClause(),
    });

    return this.attachMeta(toCarResponse(car, this.storageService));
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
      select: this.buildCarSelectClause(),
    });

    return this.attachMeta(toCarResponse(car, this.storageService));
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
      select: this.buildCarSelectClause(),
    });

    return cars.map((car) => this.attachMeta(toCarResponse(car, this.storageService)));
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

  private async findCarOrThrow(id: string) {
    const existing = await this.prismaService.car.findUnique({
      where: { id },
      select: { featureImageKey: true, additionalImageKeys: true, organizationId: true },
    });
    if (!existing) {
      throw new CarNotFoundException();
    }
    return existing;
  }

  // Server-generated key; the extension comes from the VERIFIED mime type, never from the
  // uploaded filename. → docs/pattern/STORAGE-PATTERN.md
  private async putCarImage(
    organizationId: string,
    carId: string,
    kind: 'feature' | 'additional',
    file: Express.Multer.File,
  ): Promise<string> {
    const extension = EXTENSION_BY_MIME[file.mimetype];
    const key = `organizations/${organizationId}/cars/${carId}/${kind}-${Date.now()}.${extension}`;

    try {
      await this.storageService.put(key, file.buffer, file.mimetype);
    } catch {
      throw new UploadFailedException();
    }

    return key;
  }

  async updateFeatureImage(id: string, file: Express.Multer.File): Promise<CarWithMeta> {
    const existing = await this.findCarOrThrow(id);
    const featureImageKey = await this.putCarImage(existing.organizationId, id, 'feature', file);

    const car = await this.prismaService.car.update({
      where: { id },
      data: { featureImageKey },
      select: this.buildCarSelectClause(),
    });

    // Best-effort prune of the previous object — a cleanup failure must NOT fail the request
    if (existing.featureImageKey) {
      try {
        await this.storageService.delete(existing.featureImageKey);
      } catch {
        // swallow — an orphaned object is a cleanup problem, not a user-facing one
      }
    }

    return this.attachMeta(toCarResponse(car, this.storageService));
  }

  async addAdditionalImage(id: string, file: Express.Multer.File): Promise<CarWithMeta> {
    const existing = await this.findCarOrThrow(id);
    const additionalImageKey = await this.putCarImage(
      existing.organizationId,
      id,
      'additional',
      file,
    );

    const car = await this.prismaService.car.update({
      where: { id },
      data: { additionalImageKeys: { push: additionalImageKey } },
      select: this.buildCarSelectClause(),
    });

    return this.attachMeta(toCarResponse(car, this.storageService));
  }

  // The client identifies the image by its public URL (the only form it ever sees), so the
  // key is resolved by matching the stored list — never by parsing the URL.
  async removeAdditionalImage(id: string, imageUrl: string): Promise<CarWithMeta> {
    const existing = await this.findCarOrThrow(id);
    const removedKey = existing.additionalImageKeys.find(
      (key) => this.storageService.getPublicUrl(key) === imageUrl,
    );
    if (!removedKey) {
      throw new CarNotFoundException();
    }

    const car = await this.prismaService.car.update({
      where: { id },
      data: {
        additionalImageKeys: existing.additionalImageKeys.filter((key) => key !== removedKey),
      },
      select: this.buildCarSelectClause(),
    });

    try {
      await this.storageService.delete(removedKey);
    } catch {
      // swallow — an orphaned object is a cleanup problem, not a user-facing one
    }

    return this.attachMeta(toCarResponse(car, this.storageService));
  }
}
