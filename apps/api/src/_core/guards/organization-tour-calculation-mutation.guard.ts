import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { ORGANIZATION_MEMBER_STATUS, ORGANIZATION_ROLE_CODE } from 'src/_common/constants/organization.constant';
import { OrganizationMemberLockedException, OrganizationNotMemberException, OrganizationPermissionDeniedException } from 'src/_common/exceptions/organization.exception';
import { TourCalculationNotFoundException, TourNotFoundException } from 'src/_common/exceptions/tour.exception';
import { AuthenticatedRequest } from 'src/_common/interfaces/interface';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrganizationTourCalculationMutationGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user.userId;
    const params = request.params as Record<string, string>;
    const recordId = params?.id;

    if (!recordId) throw new ForbiddenException('Resource not specified');

    const tourCalculation = await this.prismaService.tourCalculation.findUnique({
      where: { id: recordId },
      select: { tourId: true },
    });
    if (!tourCalculation) throw new TourCalculationNotFoundException();

    const tour = await this.prismaService.tour.findUnique({
      where: { id: tourCalculation.tourId },
      select: { organizationId: true, createdByUserId: true },
    });
    if (!tour) throw new TourNotFoundException();

    const member = await this.prismaService.organizationMember.findFirst({
      where: { userId, organizationId: tour.organizationId },
      select: { status: true, organizationRole: { select: { code: true } } },
    });
    if (!member) throw new OrganizationNotMemberException();
    if (member.status === ORGANIZATION_MEMBER_STATUS.LOCKED)
      throw new OrganizationMemberLockedException();
    if (member.organizationRole.code === ORGANIZATION_ROLE_CODE.OWNER) return true;

    if (tour.createdByUserId && tour.createdByUserId === userId) return true;

    throw new OrganizationPermissionDeniedException();
  }
}
