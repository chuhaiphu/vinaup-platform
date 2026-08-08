import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import {
  TOUR_TARGET_RESOURCE,
  TourTargetResource,
} from 'src/_common/constants/tour.constant';
import {
  TourImplementationAssignedUserNotFoundException,
  TourImplementationAssignmentNotFoundException,
  TourImplementationNotFoundException,
} from 'src/_common/exceptions/tour.exception';
import { AuthenticatedRequest } from 'src/_common/interfaces/interface';
import {
  TOUR_IMPLEMENTATION_ACCESS_KEY,
  TourImplementationAccessMetadata,
} from 'src/_core/decorators/tour-implementation-access.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import { TourImplementationAccessService } from 'src/tour/services/tour-implementation-access.service';

@Injectable()
export class TourImplementationAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prismaService: PrismaService,
    private readonly tourImplementationAccessService: TourImplementationAccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // ─── Step 1: Read how this route declares its access
    // A route without the metadata is not access-guarded: pass it through untouched.
    const metadata = this.reflector.get<TourImplementationAccessMetadata | undefined>(
      TOUR_IMPLEMENTATION_ACCESS_KEY,
      context.getHandler(),
    );
    if (!metadata) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const { userId } = request.user;

    // ─── Step 2: Read the raw id off the request (param or body)
    const rawId = this.readTargetId(request, metadata);
    if (!rawId) {
      throw new ForbiddenException(
        `Tour access id not found at ${metadata.source}.${metadata.idKey}`,
      );
    }

    // ─── Step 3: Resolve the tour implementation (one hop for a child-keyed route)
    const tourImplementationId = await this.resolveTourImplementationId(
      rawId,
      metadata.targetResource,
    );

    // ─── Step 4: Decide — the single ReBAC assertion, shared with the receipt-payment service
    await this.tourImplementationAccessService.assertTourImplementationAccess(tourImplementationId, userId, {
      requiredAccessLevel: metadata.requiredAccessLevel,
    });
    return true;
  }

  private readTargetId(
    request: AuthenticatedRequest,
    metadata: TourImplementationAccessMetadata,
  ): string | undefined {
    if (metadata.source === 'param') {
      const params = request.params as Record<string, string | undefined>;
      return params?.[metadata.idKey];
    }
    const body = (request.body ?? {}) as Record<string, unknown>;
    return body[metadata.idKey] as string | undefined;
  }

  // TOUR_IMPLEMENTATION → the id itself; the child resources walk one hop to the implementation.
  private async resolveTourImplementationId(
    rawId: string,
    targetResource: TourTargetResource,
  ): Promise<string> {
    switch (targetResource) {
      case TOUR_TARGET_RESOURCE.TOUR_IMPLEMENTATION:
        return rawId;
      case TOUR_TARGET_RESOURCE.TOUR: {
        const implementation = await this.prismaService.tourImplementation.findUnique({
          where: { tourId: rawId },
          select: { id: true },
        });
        if (!implementation) {
          throw new TourImplementationNotFoundException();
        }
        return implementation.id;
      }
      case TOUR_TARGET_RESOURCE.TOUR_IMPLEMENTATION_ASSIGNMENT: {
        const assignment = await this.prismaService.tourImplementationAssignment.findUnique({
          where: { id: rawId },
          select: { tourImplementationId: true },
        });
        if (!assignment) {
          throw new TourImplementationAssignmentNotFoundException();
        }
        return assignment.tourImplementationId;
      }
      case TOUR_TARGET_RESOURCE.USER_ASSIGNED_TOUR_IMPLEMENTATION: {
        const userAssigned = await this.prismaService.userAssignedTourImplementation.findUnique({
          where: { id: rawId },
          select: { tourImplementationAssignment: { select: { tourImplementationId: true } } },
        });
        if (!userAssigned?.tourImplementationAssignment) {
          throw new TourImplementationAssignedUserNotFoundException();
        }
        return userAssigned.tourImplementationAssignment.tourImplementationId;
      }
    }
  }
}
