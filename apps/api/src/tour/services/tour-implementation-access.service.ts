import { Injectable } from '@nestjs/common';

import { ORGANIZATION_ROLE_CODE } from 'src/_common/constants/organization.constant';
import {
  TOUR_IMPLEMENTATION_ACCESS_LEVEL,
  TourImplementationAccessLevel,
} from 'src/_common/constants/tour.constant';
import {
  TourImplementationAccessDeniedException,
  TourImplementationNotFoundException,
} from 'src/_common/exceptions/tour.exception';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TourImplementationAccessService {
  constructor(private readonly prismaService: PrismaService) {}

  async assertTourImplementationAccess(
    tourImplementationId: string,
    userId: string,
    options?: { requiredAccessLevel?: TourImplementationAccessLevel },
  ): Promise<void> {
    // Default to MANAGER — the strictest bar (fail-closed): the plane's guarded routes are crew
    // management, a manager-level action, so a route that forgets to relax the bar denies too much
    // rather than granting too much.
    const requiredAccessLevel = options?.requiredAccessLevel ?? TOUR_IMPLEMENTATION_ACCESS_LEVEL.MANAGER;

    // ─── Existence first: a missing implementation is a 404, never an access 403 ─────
    const implementation = await this.prismaService.tourImplementation.findUnique({
      where: { id: tourImplementationId },
      select: { tour: { select: { organizationId: true } } },
    });
    if (!implementation) {
      throw new TourImplementationNotFoundException();
    }

    // ─── Owner-implies-access: the org owner may act on any tour in their organization ─────
    // Prevents an owner being locked out of a tour they were never explicitly assigned to.
    if (await this.isOrganizationOwner(implementation.tour.organizationId, userId)) {
      return;
    }

    // ─── Member-assigned (an organization member on the implementation) — the crew-management level ─────
    if (await this.isMemberAssigned(tourImplementationId, userId)) {
      return;
    }

    // ─── ASSIGNEE also admits a non-member assigned user (tour guide/driver) ─────
    if (requiredAccessLevel === TOUR_IMPLEMENTATION_ACCESS_LEVEL.ASSIGNEE && (await this.isUserAssigned(tourImplementationId, userId))) {
      return;
    }

    throw new TourImplementationAccessDeniedException();
  }

  // An organization member assigned to run this implementation (a member-assigned row).
  async isMemberAssigned(tourImplementationId: string, userId: string): Promise<boolean> {
    const count = await this.prismaService.memberAssignedTourImplementation.count({
      where: { tourImplementationId, organizationMember: { userId } },
    });
    return count > 0;
  }

  // A non-member user assigned to one of this implementation's assignments (tour guide/driver).
  async isUserAssigned(tourImplementationId: string, userId: string): Promise<boolean> {
    const count = await this.prismaService.userAssignedTourImplementation.count({
      where: { userId, tourImplementationAssignment: { tourImplementationId } },
    });
    return count > 0;
  }

  // Holds the OWNER role in this organization — the single locked role (RBAC-ReBAC-PATTERN §3).
  private async isOrganizationOwner(organizationId: string, userId: string): Promise<boolean> {
    const count = await this.prismaService.organizationMember.count({
      where: {
        userId,
        organizationId,
        organizationRole: { code: ORGANIZATION_ROLE_CODE.OWNER },
      },
    });
    return count > 0;
  }
}
