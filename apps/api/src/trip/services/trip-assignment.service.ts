import { Injectable } from '@nestjs/common';
import {
  CAR_STATUS,
  TRIP_STATUS,
  type CreateTripAssignmentRequestInterface,
  type UpdateTripAssignmentRequestInterface,
} from '@vinaup-platform/validation';

import { CarLockedException } from 'src/_common/exceptions/car.exception';
import {
  TripAssignmentCarAlreadyInTripException,
  TripAssignmentCarNotFoundException,
  TripAssignmentMemberNotFoundException,
  TripAssignmentNotFoundException,
  TripNotFoundException,
} from 'src/_common/exceptions/trip.exception';
import { generateDateOverlapClause } from 'src/_common/utils/generator/generate-date-overlap-clause';
import { PrismaService } from 'src/prisma/prisma.service';

import {
  tripAssignmentQueryArgs,
  type ConflictingTrip,
  type TripAssignmentMeta,
  type TripAssignmentResponse,
  type TripAssignmentWithMeta,
} from '../dtos/trip-assignment.response.dto';

// Normalized shape of one overlapping assignment returned by findOverlappingTripAssignments:
// member relation rows are flattened to a plain id list for the meta builder.
interface OverlappingTripAssignment {
  carId: string | null;
  memberIds: string[];
  trip: ConflictingTrip;
}

@Injectable()
export class TripAssignmentService {
  constructor(private readonly prismaService: PrismaService) {}

  async findTripAssignmentsByTripId(tripId: string): Promise<TripAssignmentWithMeta[]> {
    const trip = await this.prismaService.trip.findUnique({
      where: { id: tripId },
      select: { startDate: true, endDate: true },
    });
    if (!trip) throw new TripNotFoundException();

    const tripAssignments = await this.prismaService.tripAssignment.findMany({
      where: { tripId },
      orderBy: { createdAt: 'desc' },
      ...tripAssignmentQueryArgs,
    });
    if (!tripAssignments.length) return [];

    const overlappingTripAssignments = await this.findOverlappingTripAssignments(tripId, trip);

    return tripAssignments.map((tripAssignment) => ({
      ...tripAssignment,
      meta: this.attachMeta(tripAssignment, overlappingTripAssignments),
    }));
  }

  async createTripAssignment(
    createTripAssignmentReq: CreateTripAssignmentRequestInterface,
  ): Promise<TripAssignmentWithMeta> {
    // Replaces the old @IsTripExist async validator — a DB-backed existence
    // rule lives in the service, not the schema (Coding Convention §7.3).
    const trip = await this.prismaService.trip.findUnique({
      where: { id: createTripAssignmentReq.tripId },
      select: { id: true },
    });
    if (!trip) throw new TripNotFoundException();

    // Car and members are assigned later via update.
    const created = await this.prismaService.tripAssignment.create({
      data: { tripId: createTripAssignmentReq.tripId, note: createTripAssignmentReq.note },
      ...tripAssignmentQueryArgs,
    });

    // A brand-new turn has no car and no members, so it cannot conflict yet.
    return {
      ...created,
      meta: { canEdit: true, carConflictingTrips: [], conflictingTripsByMemberId: {} },
    };
  }

  async updateTripAssignment(
    id: string,
    updateTripAssignmentReq: UpdateTripAssignmentRequestInterface,
  ): Promise<TripAssignmentWithMeta> {
    const existing = await this.prismaService.tripAssignment.findUnique({
      where: { id },
      include: { trip: { select: { organizationId: true, startDate: true, endDate: true } } },
    });
    if (!existing) throw new TripAssignmentNotFoundException();

    const { organizationId } = existing.trip;
    if (updateTripAssignmentReq.carId) {
      await this.assertCarAssignable(updateTripAssignmentReq.carId, organizationId);
      await this.assertCarInTripAssignmentNotAlreadyInTrip(
        existing.tripId,
        updateTripAssignmentReq.carId,
        id,
      );
    }
    if (updateTripAssignmentReq.organizationMemberIds?.length) {
      await this.assertMembersInOrganization(updateTripAssignmentReq.organizationMemberIds, organizationId);
    }

    // ─── Drop duplicates ───
    const uniqueMemberIds = Array.from(new Set(updateTripAssignmentReq.organizationMemberIds ?? []));

    // ─── shape each id into the row object Prisma `create` expects ───
    const memberIdsToCreate = uniqueMemberIds.map((organizationMemberId) => ({
      organizationMemberId,
    }));

    const updated = await this.prismaService.tripAssignment.update({
      where: { id },
      data: {
        carId: updateTripAssignmentReq.carId,
        note: updateTripAssignmentReq.note,
        // Replace the member set — but ONLY when the client sent a list (undefined = leave unchanged).
        // Inside, Prisma runs the ops in order:
        //   deleteMany: {} — an EMPTY filter matches ALL member rows, it means "delete all".
        //   create        — re-inserts memberRowsToCreate.
        members: updateTripAssignmentReq.organizationMemberIds && {
          deleteMany: {},
          create: memberIdsToCreate,
        },
      },
      ...tripAssignmentQueryArgs,
    });

    const overlappingTripAssignments = await this.findOverlappingTripAssignments(
      existing.tripId,
      existing.trip,
    );
    return {
      ...updated,
      meta: this.attachMeta(updated, overlappingTripAssignments),
    };
  }

  async deleteTripAssignmentById(id: string): Promise<void> {
    const existing = await this.prismaService.tripAssignment.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new TripAssignmentNotFoundException();

    await this.prismaService.tripAssignment.delete({ where: { id } });
  }

  // Finds trip assignments from OTHER non-cancelled trips whose dates overlap in the provided window.
  // Returns each trip assignment's carId, member ids and its trip projection.
  private async findOverlappingTripAssignments(
    tripId: string,
    window: { startDate: Date; endDate: Date },
  ): Promise<OverlappingTripAssignment[]> {
    const overlappingTripAssignments = await this.prismaService.tripAssignment.findMany({
      where: {
        trip: {
          id: { not: tripId }, // exclude this trip's own turns
          status: { not: TRIP_STATUS.CANCELLED }, // a cancelled trip freed its resources
          ...generateDateOverlapClause({
            startDate: window.startDate.toISOString(),
            endDate: window.endDate.toISOString(),
          }),
        },
      },
      select: {
        carId: true,
        members: { select: { organizationMemberId: true } },
        trip: { select: { id: true, description: true, startDate: true, endDate: true } },
      },
    });

    // Flatten each assignment's member rows to a plain id list.
    return overlappingTripAssignments.map((tripAssignment) => ({
      carId: tripAssignment.carId,
      memberIds: tripAssignment.members.map((member) => member.organizationMemberId),
      trip: tripAssignment.trip,
    }));
  }

  private attachMeta(
    currentTripAssignment: TripAssignmentResponse,
    overlappingTripAssignments: OverlappingTripAssignment[],
  ): TripAssignmentMeta {
    const assignedCarId = currentTripAssignment.carId;
    const assignedMemberIdSet = new Set(
      currentTripAssignment.members.map((member) => member.organizationMemberId),
    );

    // ─── Step 1: gather conflicting trips per resource ─────
    // Cars need no dedupe: @@unique([tripId, carId]) guarantees a car sits in at most one assignment per trip.
    // The null check is required — two trip assignments not assign car must NOT count as sharing "the same car".
    const carConflictingTrips: ConflictingTrip[] = [];
    const conflictingTripsByMemberId: Record<string, ConflictingTrip[]> = {};

    for (const overlappingTripAssignment of overlappingTripAssignments) {
      const isAssignedCarOverlapped =
        assignedCarId !== null && overlappingTripAssignment.carId === assignedCarId;
      if (isAssignedCarOverlapped) {
        carConflictingTrips.push(overlappingTripAssignment.trip);
      }

      for (const memberId of overlappingTripAssignment.memberIds) {
        const isAssignedMemberOverlapped = assignedMemberIdSet.has(memberId);
        if (isAssignedMemberOverlapped) {
          if (!conflictingTripsByMemberId[memberId]) {
            conflictingTripsByMemberId[memberId] = [];
          }
          conflictingTripsByMemberId[memberId].push(overlappingTripAssignment.trip);
        }
      }
    }

    // ─── Step 2: dedupe each member's trips by id ─────
    // A member is unique only per assignment (@@unique([tripAssignmentId, organizationMemberId])),
    // so the same member can sit in several assignments of one trip (e.g. driving two cars),
    // so conflictingTripsByMemberId can have one memberId key with several trip rows of the same tripId.
    for (const memberId of Object.keys(conflictingTripsByMemberId)) {
      // create a map with shape { tripId: tripRow }, ready to dedupe by tripId.
      const conflictingTripsByIdMap = new Map<string, ConflictingTrip>();

      // Deduplicate by tripId: if the same trip appears in one conflicting trip by the same member id,
      for (const trip of conflictingTripsByMemberId[memberId]) {
        // set() overwrites the previous value for the same tripId, so only one row per tripId remains.
        conflictingTripsByIdMap.set(trip.id, trip);
      }
      conflictingTripsByMemberId[memberId] = Array.from(conflictingTripsByIdMap.values());
    }

    return {
      canEdit: true, // no per-record edit lock; authorization is the route guard's job
      carConflictingTrips,
      conflictingTripsByMemberId,
    };
  }

  // Gates a car for assignment: it must belong to the trip's organization AND not be LOCKED.
  // Both checks read the same row, so they share one query (status doubles as the existence proof).
  private async assertCarAssignable(carId: string, organizationId: string): Promise<void> {
    const car = await this.prismaService.car.findFirst({
      where: { id: carId, organizationId },
      select: { status: true },
    });
    if (!car) throw new TripAssignmentCarNotFoundException();
    if (car.status === CAR_STATUS.LOCKED) throw new CarLockedException();
  }

  private async assertMembersInOrganization(memberIdList: string[], organizationId: string): Promise<void> {
    const uniqueMemberIdList = Array.from(new Set(memberIdList));
    const foundMemberList = await this.prismaService.organizationMember.findMany({
      where: { id: { in: uniqueMemberIdList }, organizationId },
      // We only need to know if it exists, select just the id to avoid fetching unnecessary data.
      select: { id: true },
    });
    if (foundMemberList.length !== uniqueMemberIdList.length) {
      throw new TripAssignmentMemberNotFoundException();
    }
  }

  // Enforces @@unique([tripId, carId]) with a clean 409 instead of a raw P2002 → 500.
  private async assertCarInTripAssignmentNotAlreadyInTrip(
    tripId: string,
    carId: string,
    currentTripAssignmentId: string,
  ): Promise<void> {
    const duplicate = await this.prismaService.tripAssignment.findFirst({
      where: { tripId, carId, id: { not: currentTripAssignmentId } },
      // We only need to know if it exists, select just the id to avoid fetching unnecessary data.
      select: { id: true },
    });
    if (duplicate) throw new TripAssignmentCarAlreadyInTripException();
  }
}
