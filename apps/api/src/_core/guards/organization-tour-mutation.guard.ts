import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { ORGANIZATION_MEMBER_STATUS, ORGANIZATION_ROLE_CODE } from 'src/_common/constants/organization.constant';
import { OrganizationMemberLockedException, OrganizationNotMemberException, OrganizationPermissionDeniedException } from 'src/_common/exceptions/organization.exception';
import { TourNotFoundException } from 'src/_common/exceptions/tour.exception';
import { AuthenticatedRequest } from 'src/_common/interfaces/interface';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrganizationTourMutationGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user.userId;
    const params = request.params as Record<string, string>;
    const body = request.body as Record<string, string>;
    const query = request.query as Record<string, string>;
    const recordId = params?.id ?? body?.id ?? query?.id;

    if (!recordId) throw new ForbiddenException('Resource not specified');

    const record = await this.prismaService.tour.findUnique({
      where: { id: recordId },
      select: { organizationId: true, createdByUserId: true },
    });

    if (!record) throw new TourNotFoundException();

    const member = await this.prismaService.organizationMember.findFirst({
      where: { userId, organizationId: record.organizationId },
      select: { status: true, organizationRole: { select: { code: true } } },
    });
    if (!member) throw new OrganizationNotMemberException();
    if (member.status === ORGANIZATION_MEMBER_STATUS.LOCKED)
      throw new OrganizationMemberLockedException();
    if (member.organizationRole.code === ORGANIZATION_ROLE_CODE.OWNER) return true;

    if (record.createdByUserId && record.createdByUserId === userId) return true;

    throw new OrganizationPermissionDeniedException();
  }
}
