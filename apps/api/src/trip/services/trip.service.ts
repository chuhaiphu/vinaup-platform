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

import { tripListQueryArgs, tripQueryArgs, type TripResponse } from '../dtos/trip.response.dto';

@Injectable()
export class TripService {
  constructor(private readonly prismaService: PrismaService) {}

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

    return this.prismaService.trip.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      ...tripListQueryArgs,
    });
  }

  // Replaces the old @IsOrganizationExist async validator — a DB-backed existence
  // rule lives in the service, not the schema (Coding Convention §7.3).
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

    return this.prismaService.trip.create({
      data: {
        ...createTripReq,
        createdByUserId: currentUserId,
        status: TRIP_STATUS.DRAFT,
      },
      ...tripQueryArgs,
    });
  }

  async findTripById(id: string): Promise<TripResponse> {
    const trip = await this.prismaService.trip.findUnique({
      where: { id },
      ...tripQueryArgs,
    });

    if (!trip) {
      throw new TripNotFoundException();
    }

    return trip;
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

    return this.prismaService.trip.update({
      where: { id },
      data: updateTripReq,
      ...tripQueryArgs,
    });
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
