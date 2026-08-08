import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  PERMISSION_RESOURCE,
  PermissionResource,
  getUserAbility,
  subject,
} from '@vinaup-platform/permission';

import { ORGANIZATION_MEMBER_STATUS } from 'src/_common/constants/organization.constant';
import { AttendanceConclusionNotFoundException } from 'src/_common/exceptions/attendance.exception';
import { BookingNotFoundException } from 'src/_common/exceptions/booking.exception';
import { InvoiceNotFoundException } from 'src/_common/exceptions/invoice.exception';
import {
  OrganizationMemberLockedException,
  OrganizationNotMemberException,
  OrganizationPermissionDeniedException,
} from 'src/_common/exceptions/organization.exception';
import { ProjectNotFoundException } from 'src/_common/exceptions/project.exception';
import { ReceiptPaymentCategoryNotFoundException } from 'src/_common/exceptions/receipt-payment.exception';
import {
  TourCalculationNotFoundException,
  TourImplementationNotFoundException,
  TourNotFoundException,
  TourSettlementNotFoundException,
} from 'src/_common/exceptions/tour.exception';
import { AuthenticatedRequest } from 'src/_common/interfaces/interface';
import {
  CHECK_ABILITY_KEY,
  CheckAbilityMetadata,
} from 'src/_core/decorators/check-ability.decorator';
import { PrismaService } from 'src/prisma/prisma.service';


interface ResourceOwnership {
  organizationId: string | null;
  createdByUserId: string | null;
  scopeAttributes?: Record<string, string>;
}

const OWNERSHIP_SELECT = { organizationId: true, createdByUserId: true } as const;

@Injectable()
export class OrganizationPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // ─── Step 1: Read the @CheckAbility stamped on this route
    // A route without the metadata is not permission-guarded: pass it through untouched.
    const abilityMetadata = this.reflector.get<CheckAbilityMetadata | undefined>(
      CHECK_ABILITY_KEY,
      context.getHandler(),
    );
    if (!abilityMetadata) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const { userId } = request.user;

    // ─── Step 2: Resolve the organization this request acts in
    const { organizationId, createdByUserId, scopeAttributes } = await this.resolveResourceOwnership(
      request,
      abilityMetadata.resource,
    );

    // ─── Personal (non-organization) record: no membership or role matrix applies —
    if (!organizationId) {
      if (createdByUserId && createdByUserId === userId) {
        return true;
      }
      throw new OrganizationPermissionDeniedException();
    }

    // ─── Step 3: Membership invariants
    const member = await this.prismaService.organizationMember.findFirst({
      where: { userId, organizationId },
      select: { status: true },
    });
    if (!member) {
      throw new OrganizationNotMemberException();
    }
    if (member.status === ORGANIZATION_MEMBER_STATUS.LOCKED) {
      throw new OrganizationMemberLockedException();
    }

    // ─── Step 4: Ownership invariant — the record's creator may always act on it
    if (createdByUserId && createdByUserId === userId) {
      return true;
    }

    // ─── Step 5: Ask the engine with the caller's role in THIS organization
    // Read fresh from the DB so an owner's matrix edit takes effect on the next request.
    const rolePermissionList = await this.prismaService.organizationRolePermission.findMany({
      where: {
        organizationRole: {
          organizationId,
          organizationMembers: { some: { userId } },
        },
      },
      select: {
        organizationPermission: { select: { action: true, resource: true, scope: true } },
      },
    });
    const userAbility = getUserAbility(
      rolePermissionList.map((row) => row.organizationPermission),
    );

    const resource = scopeAttributes
      ? subject(abilityMetadata.resource, scopeAttributes)
      : abilityMetadata.resource;

    const isAllowed = userAbility.can(abilityMetadata.action, resource);
    if (!isAllowed) {
      throw new OrganizationPermissionDeniedException();
    }
    return true;
  }

  private async resolveResourceOwnership(
    request: AuthenticatedRequest,
    resource: PermissionResource,
  ): Promise<ResourceOwnership> {
    const recordId = (request.params as Record<string, string | undefined>)?.id;

    // Flow 1a — the route has record id
    if (recordId) {
      return this.resolveOwnershipFromRecord(resource, recordId);
    }

    // Flow 1b — no record id
    return this.resolveOwnershipFromRequest(request, resource);
  }

  // read the organization id straight from the request
  private resolveOwnershipFromRequest(
    request: AuthenticatedRequest,
    resource: PermissionResource,
  ): ResourceOwnership {
    const params = request.params as Record<string, string | undefined>;
    const body = (request.body ?? {}) as Record<string, unknown>;

    const organizationId = params?.organizationId ?? (body.organizationId as string | undefined);
    if (!organizationId) {
      throw new ForbiddenException('Organization not specified');
    }

    const scopeAttributes =
      resource === PERMISSION_RESOURCE.INVOICE && typeof body.type === 'string'
        ? { type: body.type }
        : undefined;

    return { organizationId, createdByUserId: null, scopeAttributes };
  }

  // The single place that knows how each resource finds its organization id from a record id.
  // Extend with a case as each resource adopts @CheckAbility.
  private async resolveOwnershipFromRecord(
    resource: PermissionResource,
    recordId: string,
  ): Promise<ResourceOwnership> {
    switch (resource) {
      // These entities carry their own organizationId + createdByUserId.
      case PERMISSION_RESOURCE.TOUR:
        return this.resolveTourOwnership(recordId);
      case PERMISSION_RESOURCE.BOOKING: {
        const booking = await this.prismaService.booking.findUnique({
          where: { id: recordId },
          select: OWNERSHIP_SELECT,
        });
        if (!booking) {
          throw new BookingNotFoundException();
        }
        return booking;
      }
      case PERMISSION_RESOURCE.INVOICE: {
        // The invoice type feeds the scoped-cell instance check (SELL / BUY).
        const invoice = await this.prismaService.invoice.findUnique({
          where: { id: recordId },
          select: { ...OWNERSHIP_SELECT, type: true },
        });
        if (!invoice) {
          throw new InvoiceNotFoundException();
        }
        return {
          organizationId: invoice.organizationId,
          createdByUserId: invoice.createdByUserId,
          scopeAttributes: { type: invoice.type },
        };
      }
      case PERMISSION_RESOURCE.PROJECT: {
        const project = await this.prismaService.project.findUnique({
          where: { id: recordId },
          select: OWNERSHIP_SELECT,
        });
        if (!project) {
          throw new ProjectNotFoundException();
        }
        return project;
      }
      case PERMISSION_RESOURCE.ATTENDANCE_CONCLUSION: {
        const attendanceConclusion = await this.prismaService.attendanceConclusion.findUnique({
          where: { id: recordId },
          select: OWNERSHIP_SELECT,
        });
        if (!attendanceConclusion) {
          throw new AttendanceConclusionNotFoundException();
        }
        return attendanceConclusion;
      }
      case PERMISSION_RESOURCE.RECEIPT_PAYMENT_CATEGORY: {
        const receiptPaymentCategory = await this.prismaService.receiptPaymentCategory.findUnique({
          where: { id: recordId },
          select: { organizationId: true, userId: true },
        });
        if (!receiptPaymentCategory) {
          throw new ReceiptPaymentCategoryNotFoundException();
        }
        return {
          organizationId: receiptPaymentCategory.organizationId,
          createdByUserId: receiptPaymentCategory.userId,
        };
      }

      // Tour sub-entities resolve their organization through the parent tour id
      case PERMISSION_RESOURCE.TOUR_CALCULATION: {
        const tourCalculation = await this.prismaService.tourCalculation.findUnique({
          where: { id: recordId },
          select: { tourId: true },
        });
        if (!tourCalculation) {
          throw new TourCalculationNotFoundException();
        }
        return this.resolveTourOwnership(tourCalculation.tourId);
      }
      case PERMISSION_RESOURCE.TOUR_IMPLEMENTATION: {
        const tourImplementation = await this.prismaService.tourImplementation.findUnique({
          where: { id: recordId },
          select: { tourId: true },
        });
        if (!tourImplementation) {
          throw new TourImplementationNotFoundException();
        }
        return this.resolveTourOwnership(tourImplementation.tourId);
      }
      case PERMISSION_RESOURCE.TOUR_SETTLEMENT: {
        const tourSettlement = await this.prismaService.tourSettlement.findUnique({
          where: { id: recordId },
          select: { tourId: true },
        });
        if (!tourSettlement) {
          throw new TourSettlementNotFoundException();
        }
        return this.resolveTourOwnership(tourSettlement.tourId);
      }

      default:
        throw new ForbiddenException(`No record resolver registered for resource ${resource}`);
    }
  }

  private async resolveTourOwnership(tourId: string): Promise<ResourceOwnership> {
    const tour = await this.prismaService.tour.findUnique({
      where: { id: tourId },
      select: OWNERSHIP_SELECT,
    });
    if (!tour) {
      throw new TourNotFoundException();
    }
    return tour;
  }
}
