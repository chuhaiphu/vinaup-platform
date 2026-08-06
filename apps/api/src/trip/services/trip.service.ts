import { Injectable } from '@nestjs/common';
import {
  TRIP_STATUS,
  type CreateTripRequestInterface,
  type TripFilterRequestInterface,
  type UpdateTripRequestInterface,
} from '@vinaup-platform/validation';

import { OrganizationNotFoundException } from 'src/_common/exceptions/organization.exception';
import { TripNotFoundException } from 'src/_common/exceptions/trip.exception';
import { generateDateOverlapClause } from 'src/_common/utils/generator/generate-date-overlap-clause';
import { PrismaService } from 'src/prisma/prisma.service';
import { StorageService } from 'src/storage/storage.service';

import { tripListQueryArgs, toTripResponse, tripQueryArgs, type TripResponse } from '../dtos/trip.response.dto';

@Injectable()
export class TripService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async findTripsByOrganizationId(
    organizationId: string,
    filter?: TripFilterRequestInterface
  ): Promise<TripResponse[]> {
    const dateFilterClause = generateDateOverlapClause(filter);

    const whereClause = {
      organizationId: organizationId,
      ...(filter?.status && { status: filter.status }),
      ...dateFilterClause,
    };

    const rows = await this.prismaService.trip.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      ...tripListQueryArgs,
    });

    return rows.map((row) => toTripResponse(row, this.storageService));
  }

  private async assertOrganizationExists(organizationId: string): Promise<void> {
    const organization = await this.prismaService.organization.findUnique({
      where: { id: organizationId },
      select: { id: true },
    });
    if (!organization) throw new OrganizationNotFoundException();
  }

  async createTrip(
    createTripReq: CreateTripRequestInterface,
    currentUserId: string
  ): Promise<TripResponse> {
    await this.assertOrganizationExists(createTripReq.organizationId);

    const trip = await this.prismaService.trip.create({
      data: {
        ...createTripReq,
        createdByUserId: currentUserId,
        status: TRIP_STATUS.DRAFT,
      },
      ...tripQueryArgs,
    });

    return toTripResponse(trip, this.storageService);
  }

  async findTripById(id: string): Promise<TripResponse> {
    const trip = await this.prismaService.trip.findUnique({
      where: { id },
      ...tripQueryArgs,
    });

    if (!trip) {
      throw new TripNotFoundException();
    }

    return toTripResponse(trip, this.storageService);
  }

  async updateTrip(
    id: string,
    updateTripReq: UpdateTripRequestInterface
  ): Promise<TripResponse> {
    const existingTrip = await this.prismaService.trip.findUnique({
      where: { id },
    });

    if (!existingTrip) {
      throw new TripNotFoundException();
    }

    if (updateTripReq.organizationId) {
      await this.assertOrganizationExists(updateTripReq.organizationId);
    }

    const trip = await this.prismaService.trip.update({
      where: { id },
      data: updateTripReq,
      ...tripQueryArgs,
    });

    return toTripResponse(trip, this.storageService);
  }

  async deleteTripById(id: string): Promise<void> {
    const existingTrip = await this.prismaService.trip.findUnique({
      where: { id },
    });

    if (!existingTrip) {
      throw new TripNotFoundException();
    }

    await this.prismaService.trip.delete({
      where: { id },
    });
  }
}
