import { Injectable } from '@nestjs/common';

import {
  TourImplementationCannotRemoveCreatorException,
  TourImplementationNotFoundException,
} from 'src/_common/exceptions/tour.exception';
import { PrismaService } from 'src/prisma/prisma.service';

import { TourImplementationAssignmentService } from './tour-implementation-assignment.service';
import { ManageMembersAssignedRequest } from '../dtos/manage-members-assigned.request.dto';
import {
  MemberAssignedTourImplementationResponse,
  MemberAssignedTourImplementationWithMeta,
} from '../dtos/member-assigned-tour-implementation.response.dto';
import {
  TourImplementationResponse,
  TourImplementationWithMeta,
} from '../dtos/tour-implementation.response.dto';
import { UpdateTourImplementationRequest } from '../dtos/update-tour-implementation.request.dto';

@Injectable()
export class TourImplementationService {
  constructor(
    private readonly prismaService: PrismaService,
    // The aggregate embeds assignments with conflict meta, so it delegates the conflict engine
    // and the assigned authz to the assignment service — one owner, no duplication, no cycle
    // (this service depends on the assignment service, never the reverse).
    private readonly tourImplementationAssignmentService: TourImplementationAssignmentService,
  ) {}

  async findTourImplementationByTourId(
    tourId: string,
    currentUserId: string,
  ): Promise<TourImplementationWithMeta> {
    const tourImplementation = await this.prismaService.tourImplementation.findUnique({
      where: { tourId },
      include: {
        createdBy: true,
        tour: true,
        membersAssigned: {
          include: {
            organizationMember: true,
          },
        },
        tourImplementationAssignments: {
          include: {
            usersAssigned: {
              include: {
                user: true,
              },
            },
          },
          orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
        },
        tourImplementationReceiptPayments: true,
      },
    });
    if (!tourImplementation) {
      throw new TourImplementationNotFoundException();
    }
    const canEdit = await this.tourImplementationAssignmentService.isMemberAssigned(
      tourImplementation.id,
      currentUserId,
    );

    const tourImplementationAssignments =
      await this.tourImplementationAssignmentService.attachConflictMetaToTourImplementationAssignments(
        tourImplementation.id,
        tourImplementation.tour,
        tourImplementation.tourImplementationAssignments,
        canEdit,
      );

    return {
      ...tourImplementation,
      tourImplementationAssignments,
      meta: { canEdit },
    };
  }

  async updateTourImplementation(
    tourImplementationId: string,
    updateTourImplementationReq: UpdateTourImplementationRequest,
    currentUserId: string,
  ): Promise<TourImplementationResponse> {
    await this.tourImplementationAssignmentService.assertTourImplementationAssigned(
      tourImplementationId,
      currentUserId,
    );

    const updatedTourImplementation = await this.prismaService.tourImplementation.update({
      where: { id: tourImplementationId },
      data: updateTourImplementationReq,
      include: {
        createdBy: true,
        tour: true,
        membersAssigned: true,
        tourImplementationAssignments: {
          include: {
            usersAssigned: {
              include: {
                user: true,
              },
            },
          },
          orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
        },
        tourImplementationReceiptPayments: true,
      },
    });

    // The assigned check above already passed, so this caller may edit the records.
    return {
      ...updatedTourImplementation,
      tourImplementationAssignments:
        await this.tourImplementationAssignmentService.attachConflictMetaToTourImplementationAssignments(
          updatedTourImplementation.id,
          updatedTourImplementation.tour,
          updatedTourImplementation.tourImplementationAssignments,
          true,
        ),
    };
  }

  async getMembersAssignedByTourImplementationId(
    tourImplementationId: string,
    currentUserId: string,
  ): Promise<MemberAssignedTourImplementationWithMeta[]> {
    const membersAssigned = await this.prismaService.memberAssignedTourImplementation.findMany({
      where: { tourImplementationId },
      include: {
        organizationMember: true,
      },
    });
    const canEdit = await this.tourImplementationAssignmentService.isMemberAssigned(
      tourImplementationId,
      currentUserId,
    );
    return membersAssigned.map((m) => ({ ...m, meta: { canEdit } }));
  }

  async manageMembersAssigned(
    tourImplementationId: string,
    payload: ManageMembersAssignedRequest,
    currentUserId: string,
  ): Promise<MemberAssignedTourImplementationResponse[]> {
    await this.tourImplementationAssignmentService.assertTourImplementationAssigned(
      tourImplementationId,
      currentUserId,
    );

    const existing = await this.prismaService.memberAssignedTourImplementation.findMany({
      where: { tourImplementationId },
    });

    const existingMemberIdSet = new Set(
      existing.map((m) => m.organizationMemberId).filter((id): id is string => id !== null),
    );
    const targetMemberIdSet = new Set(payload.organizationMemberIds);

    const toDelete = existing.filter(
      (m) => !m.organizationMemberId || !targetMemberIdSet.has(m.organizationMemberId),
    );

    const toCreateIds = payload.organizationMemberIds.filter((id) => !existingMemberIdSet.has(id));

    if (toDelete.length > 0) {
      const isContainingProtectedMember = toDelete.some((m) => m.role === 'CREATOR');
      if (isContainingProtectedMember) {
        throw new TourImplementationCannotRemoveCreatorException();
      }
      await this.prismaService.memberAssignedTourImplementation.deleteMany({
        where: { id: { in: toDelete.map((m) => m.id) } },
      });
    }

    if (toCreateIds.length > 0) {
      await this.prismaService.memberAssignedTourImplementation.createMany({
        data: toCreateIds.map((organizationMemberId) => ({
          tourImplementationId,
          organizationMemberId,
          role: 'DIRECTOR',
        })),
      });
    }

    return this.prismaService.memberAssignedTourImplementation.findMany({
      where: { tourImplementationId },
      include: { organizationMember: true },
    });
  }
}
