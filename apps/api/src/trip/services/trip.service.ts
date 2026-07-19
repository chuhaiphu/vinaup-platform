import { Injectable } from '@nestjs/common';

import { TRIP_STATUS } from 'src/_common/constants/trip.constant';
import { TripNotFoundException } from 'src/_common/exceptions/trip.exception';
import { generateDateOverlapClause } from 'src/_common/utils/generator/generate-date-overlap-clause';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreateTripRequest } from '../dtos/create-trip.request.dto';
import { TripFilterParam } from '../dtos/trip-filter.param.dto';
import { TripResponse } from '../dtos/trip.response.dto';
import { UpdateTripRequest } from '../dtos/update-trip.request.dto';

@Injectable()
export class TripService {
  constructor(private readonly prismaService: PrismaService) {}

  async findTripsByOrganizationId(
    organizationId: string,
    filter?: TripFilterParam
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
      include: {
        createdBy: true,
        organization: true,
        organizationCustomer: true,
        // ─── Embed assignments so each list card can summarise drivers + cars ─────
        tripAssignments: {
          include: {
            car: true,
            members: { include: { organizationMember: true } },
          },
        },
      },
    });
  }

  async createTrip(
    createTripReq: CreateTripRequest,
    currentUserId: string
  ): Promise<TripResponse> {
    return this.prismaService.trip.create({
      data: {
        ...createTripReq,
        createdByUserId: currentUserId,
        status: TRIP_STATUS.DRAFT,
      },
      include: {
        createdBy: true,
        organization: true,
        organizationCustomer: true,
      },
    });
  }

  async findTripById(id: string): Promise<TripResponse> {
    const trip = await this.prismaService.trip.findUnique({
      where: { id },
      include: {
        createdBy: true,
        organization: true,
        organizationCustomer: true,
      },
    });

    if (!trip) {
      throw new TripNotFoundException();
    }

    return trip;
  }

  async updateTrip(
    id: string,
    updateTripReq: UpdateTripRequest
  ): Promise<TripResponse> {
    const existingTrip = await this.prismaService.trip.findUnique({
      where: { id },
    });

    if (!existingTrip) {
      throw new TripNotFoundException();
    }

    return this.prismaService.trip.update({
      where: { id },
      data: updateTripReq,
      include: {
        createdBy: true,
        organization: true,
        organizationCustomer: true,
      },
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
