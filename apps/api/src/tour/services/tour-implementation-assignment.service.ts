import { Injectable } from '@nestjs/common';

import { TOUR_STATUS } from 'src/_common/constants/tour.constant';
import {
  TourImplementationAssignmentNotFoundException,
  TourImplementationCannotRemoveSelfException,
  TourImplementationAssignedUserNotFoundException,
  TourImplementationNotFoundException,
  TourImplementationNotAssignedException,
} from 'src/_common/exceptions/tour.exception';
import { generateDateOverlapClause } from 'src/_common/utils/generator/generate-date-overlap-clause';
import { TourImplementationAssignment, UserAssignedTourImplementation } from 'src/prisma/generated/client';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreateUserAssignedRequest } from '../dtos/create-user-assigned.request.dto';
import {
  ConflictingTour,
  TourImplementationAssignmentMeta,
  TourImplementationAssignmentResponse,
  TourImplementationAssignmentWithMeta,
} from '../dtos/tour-implementation-assignment.response.dto';
import { UpdateTourImplementationAssignmentRequest } from '../dtos/update-tour-implementation-assignment.request.dto';
import { UpdateUserAssignedRequest } from '../dtos/update-user-assigned.request.dto';
import { UserAssignedTourImplementationResponse } from '../dtos/user-assigned-tour-implementation.response.dto';

// Normalized shape of one overlapping assignment returned by findOverlappingTourImplementationAssignments:
// assigned-user relation rows are flattened to a plain id list for the meta builder.
interface OverlappingTourImplementationAssignment {
  userIds: string[];
  tour: ConflictingTour;
}

@Injectable()
export class TourImplementationAssignmentService {
  constructor(private readonly prismaService: PrismaService) {}

  // Public (not private) because the tour-implementation aggregate reuses this same assigned
  // authz primitive; it lives in this leaf service so both can share it without a circular import.
  async isMemberAssigned(tourImplementationId: string, currentUserId: string): Promise<boolean> {
    const count = await this.prismaService.memberAssignedTourImplementation.count({
      where: {
        tourImplementationId,
        organizationMember: { userId: currentUserId },
      },
    });
    return count > 0;
  }

  async assertTourImplementationAssigned(
    tourImplementationId: string,
    currentUserId: string,
  ): Promise<void> {
    const tourImplementation = await this.prismaService.tourImplementation.findUnique({
      where: { id: tourImplementationId },
      select: { id: true },
    });
    if (!tourImplementation) {
      throw new TourImplementationNotFoundException();
    }
    if (!(await this.isMemberAssigned(tourImplementationId, currentUserId))) {
      throw new TourImplementationNotAssignedException();
    }
  }

  private async findAssignmentByIdOrThrow(assignmentId: string): Promise<TourImplementationAssignment> {
    const assignment = await this.prismaService.tourImplementationAssignment.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment) {
      throw new TourImplementationAssignmentNotFoundException();
    }
    return assignment;
  }

  async createTourImplementationAssignment(
    tourImplementationId: string,
    currentUserId: string,
  ): Promise<TourImplementationAssignmentWithMeta> {
    await this.assertTourImplementationAssigned(tourImplementationId, currentUserId);

    const count = await this.prismaService.tourImplementationAssignment.count({
      where: { tourImplementationId },
    });
    const position = count + 1;

    const assignment = await this.prismaService.tourImplementationAssignment.create({
      data: {
        tourImplementationId,
        position,
        usersAssigned: {
          createMany: {
            data: [
              {
                role: 'TOUR_GUIDE',
                userId: null,
                customUserName: '',
                permissions: [],
              },
              {
                role: 'DRIVER',
                userId: null,
                customUserName: '',
                permissions: [],
              },
            ],
          },
        },
      },
      include: {
        usersAssigned: true,
      },
    });

    // A brand-new assignment's assigned users have no userId yet, so it cannot conflict yet.
    return {
      ...assignment,
      meta: { canEdit: true, conflictingToursByUserId: {} },
    };
  }

  async getAssignmentsByTourImplementationId(
    tourImplementationId: string,
    currentUserId: string,
  ): Promise<TourImplementationAssignmentWithMeta[]> {
    const tourImplementation = await this.prismaService.tourImplementation.findUnique({
      where: { id: tourImplementationId },
      select: { tour: { select: { startDate: true, endDate: true } } },
    });
    if (!tourImplementation) throw new TourImplementationNotFoundException();

    const tourImplementationAssignments = await this.prismaService.tourImplementationAssignment.findMany({
      where: { tourImplementationId },
      include: {
        usersAssigned: {
          include: {
            user: true,
          },
        },
      },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    });
    if (!tourImplementationAssignments.length) return [];

    const canEdit = await this.isMemberAssigned(tourImplementationId, currentUserId);

    return this.attachConflictMetaToTourImplementationAssignments(
      tourImplementationId,
      tourImplementation.tour,
      tourImplementationAssignments,
      canEdit,
    );
  }

  async updateTourImplementationAssignment(
    assignmentId: string,
    payload: UpdateTourImplementationAssignmentRequest,
    currentUserId: string,
  ): Promise<TourImplementationAssignmentWithMeta> {
    const existingAssignment = await this.prismaService.tourImplementationAssignment.findUnique({
      where: { id: assignmentId },
      include: { tourImplementation: { select: { tour: { select: { startDate: true, endDate: true } } } } },
    });
    if (!existingAssignment) {
      throw new TourImplementationAssignmentNotFoundException();
    }

    if (!(await this.isMemberAssigned(existingAssignment.tourImplementationId, currentUserId))) {
      throw new TourImplementationNotAssignedException();
    }

    if (payload.position !== undefined && payload.position !== existingAssignment.position) {
      const existedTourImplementationAssignment =
        await this.prismaService.tourImplementationAssignment.findFirst({
          where: {
            tourImplementationId: existingAssignment.tourImplementationId,
            position: payload.position,
            NOT: { id: assignmentId },
          },
        });

      if (existedTourImplementationAssignment) {
        await this.prismaService.$transaction([
          this.prismaService.tourImplementationAssignment.update({
            where: { id: existedTourImplementationAssignment.id },
            data: { position: existingAssignment.position },
          }),
          this.prismaService.tourImplementationAssignment.update({
            where: { id: assignmentId },
            data: {
              carName: payload.carName,
              seatCount: payload.seatCount,
              position: payload.position,
            },
          }),
        ]);
      } else {
        await this.prismaService.tourImplementationAssignment.update({
          where: { id: assignmentId },
          data: {
            carName: payload.carName,
            seatCount: payload.seatCount,
            position: payload.position,
          },
        });
      }
    } else {
      await this.prismaService.tourImplementationAssignment.update({
        where: { id: assignmentId },
        data: { carName: payload.carName, seatCount: payload.seatCount },
      });
    }

    const updatedAssignment = await this.prismaService.tourImplementationAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        usersAssigned: {
          include: {
            user: true,
          },
        },
      },
    });
    if (!updatedAssignment) {
      throw new TourImplementationAssignmentNotFoundException();
    }

    const overlappingTourImplementationAssignments =
      await this.findOverlappingTourImplementationAssignments(
        existingAssignment.tourImplementationId,
        existingAssignment.tourImplementation.tour,
      );

    // The member-assigned check above already passed, so this caller may edit the record.
    return {
      ...updatedAssignment,
      meta: this.attachMeta(updatedAssignment, overlappingTourImplementationAssignments, true),
    };
  }

  async deleteTourImplementationAssignment(assignmentId: string): Promise<void> {
    const existingAssignment = await this.findAssignmentByIdOrThrow(assignmentId);

    const { tourImplementationId, position: deletedPosition } = existingAssignment;

    await this.prismaService.$transaction(async (tx) => {
      await tx.tourImplementationAssignment.delete({
        where: { id: assignmentId },
      });

      await tx.tourImplementationAssignment.updateMany({
        where: {
          tourImplementationId,
          position: { gt: deletedPosition },
        },
        data: { position: { decrement: 1 } },
      });
    });
  }

  async addUserAssignedToTourImplementation(
    payload: CreateUserAssignedRequest,
  ): Promise<UserAssignedTourImplementationResponse> {
    await this.findAssignmentByIdOrThrow(payload.tourImplementationAssignmentId);

    const userAssigned = await this.prismaService.userAssignedTourImplementation.create({
      data: {
        tourImplementationAssignmentId: payload.tourImplementationAssignmentId,
        userId: payload.userId,
        role: payload.role,
        customUserName: payload.customUserName,
        customPhone: payload.customPhone,
        currentOption: payload.currentOption,
      },
      include: {
        user: true,
        tourImplementationAssignment: true,
      },
    });

    return userAssigned;
  }

  async updateUserAssignedToTourImplementation(
    userAssignedId: string,
    payload: UpdateUserAssignedRequest,
  ): Promise<UserAssignedTourImplementationResponse> {
    const existingRecord = await this.prismaService.userAssignedTourImplementation.findUnique({
      where: { id: userAssignedId },
    });

    if (!existingRecord) {
      throw new TourImplementationAssignedUserNotFoundException();
    }

    const updatedRecord = await this.prismaService.userAssignedTourImplementation.update({
      where: { id: userAssignedId },
      data: payload,
      include: {
        user: true,
        tourImplementationAssignment: true,
      },
    });

    return updatedRecord;
  }

  async removeUserAssignedFromTourImplementation(
    userAssignedId: string,
    currentUserId: string,
  ): Promise<void> {
    const record: UserAssignedTourImplementation | null =
      await this.prismaService.userAssignedTourImplementation.findUnique({
        where: { id: userAssignedId },
      });

    if (!record) {
      throw new TourImplementationAssignedUserNotFoundException();
    }

    if (record.userId === currentUserId) {
      throw new TourImplementationCannotRemoveSelfException();
    }

    await this.prismaService.userAssignedTourImplementation.delete({
      where: { id: userAssignedId },
    });
  }

  // Finds tour implementation assignments from OTHER non-cancelled tours whose dates overlap in the provided window.
  // Returns each tour implementation assignment's assigned-user ids and its tour projection.
  private async findOverlappingTourImplementationAssignments(
    tourImplementationId: string,
    window: { startDate: Date; endDate: Date },
  ): Promise<OverlappingTourImplementationAssignment[]> {
    const overlappingTourImplementationAssignments =
      await this.prismaService.tourImplementationAssignment.findMany({
        where: {
          tourImplementation: {
            id: { not: tourImplementationId }, // exclude this tour implementation's own assignments
            tour: {
              status: { not: TOUR_STATUS.CANCELLED }, // a cancelled tour freed its resources
              ...generateDateOverlapClause({
                startDate: window.startDate.toISOString(),
                endDate: window.endDate.toISOString(),
              }),
            },
          },
        },
        select: {
          usersAssigned: { select: { userId: true } },
          tourImplementation: {
            select: { tour: { select: { id: true, description: true, startDate: true, endDate: true } } },
          },
        },
      });

    // Flatten each assignment's assigned-user rows to a plain id list
    return overlappingTourImplementationAssignments.map((tourImplementationAssignment) => ({
      userIds: tourImplementationAssignment.usersAssigned
        .map((userAssigned) => userAssigned.userId)
        // A name-only invite (userId null) has no identity, so it is dropped.
        .filter((userId) => userId !== null),
      tour: tourImplementationAssignment.tourImplementation.tour,
    }));
  }

  private attachMeta(
    currentTourImplementationAssignment: TourImplementationAssignmentResponse,
    overlappingTourImplementationAssignments: OverlappingTourImplementationAssignment[],
    canEdit: boolean,
  ): TourImplementationAssignmentMeta {
    const assignedUserIdSet = new Set(
      currentTourImplementationAssignment.usersAssigned
        .map((userAssigned) => userAssigned.userId)
        // A name-only invite (userId null) has no identity, so it is dropped.
        .filter((userId) => userId !== null),
    );

    // ─── Step 1: gather conflicting tours per assigned user ─────
    const conflictingToursByUserId: Record<string, ConflictingTour[]> = {};

    for (const overlappingTourImplementationAssignment of overlappingTourImplementationAssignments) {
      for (const userId of overlappingTourImplementationAssignment.userIds) {
        const isAssignedUserOverlapped = assignedUserIdSet.has(userId);
        if (isAssignedUserOverlapped) {
          if (!conflictingToursByUserId[userId]) {
            conflictingToursByUserId[userId] = [];
          }
          conflictingToursByUserId[userId].push(overlappingTourImplementationAssignment.tour);
        }
      }
    }

    // ─── Step 2: dedupe each assigned user's tours by id ─────
    // An assigned user has no per-assignment uniqueness,
    // so the same user can sit in several assignments of one tour implementation,
    // so conflictingToursByUserId can have one userId key with several tour rows of the same tourId.
    for (const userId of Object.keys(conflictingToursByUserId)) {
      // create a map with shape { tourId: tourRow }, ready to dedupe by tourId.
      const conflictingToursByIdMap = new Map<string, ConflictingTour>();

      // Deduplicate by tourId: if the same tour appears in one conflicting tour by the same user id,
      for (const tour of conflictingToursByUserId[userId]) {
        // set() overwrites the previous value for the same tourId, so only one row per tourId remains.
        conflictingToursByIdMap.set(tour.id, tour);
      }
      conflictingToursByUserId[userId] = Array.from(conflictingToursByIdMap.values());
    }

    return {
      canEdit,
      conflictingToursByUserId,
    };
  }

  // Attaches conflict meta to a list of tour implementation assignments: resolves the overlapping
  // assignments once, then maps each assignment to its meta. Public so the tour-implementation
  // aggregate can embed assignments-with-meta by reusing the one conflict engine (no duplication).
  async attachConflictMetaToTourImplementationAssignments(
    tourImplementationId: string,
    window: { startDate: Date; endDate: Date },
    tourImplementationAssignments: TourImplementationAssignmentResponse[],
    canEdit: boolean,
  ): Promise<TourImplementationAssignmentWithMeta[]> {
    const overlappingTourImplementationAssignments =
      await this.findOverlappingTourImplementationAssignments(tourImplementationId, window);

    return tourImplementationAssignments.map((tourImplementationAssignment) => ({
      ...tourImplementationAssignment,
      meta: this.attachMeta(tourImplementationAssignment, overlappingTourImplementationAssignments, canEdit),
    }));
  }
}
