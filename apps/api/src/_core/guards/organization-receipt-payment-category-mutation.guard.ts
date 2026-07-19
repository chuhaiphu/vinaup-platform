import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { ORGANIZATION_MEMBER_STATUS } from 'src/_common/constants/organization.constant';
import { OrganizationMemberLockedException, OrganizationNotMemberException, OrganizationPermissionDeniedException } from 'src/_common/exceptions/organization.exception';
import { ReceiptPaymentCategoryNotFoundException, ReceiptPaymentCategorySystemReadonlyException } from 'src/_common/exceptions/receipt-payment.exception';
import { AuthenticatedRequest } from 'src/_common/interfaces/interface';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrganizationReceiptPaymentCategoryMutationGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user.userId;
    const params = request.params as Record<string, string>;
    const recordId = params?.id;

    if (!recordId) throw new ForbiddenException('Resource not specified');

    const record = await this.prismaService.receiptPaymentCategory.findUnique({
      where: { id: recordId },
      select: { isSystem: true, userId: true, organizationId: true },
    });

    if (!record) throw new ReceiptPaymentCategoryNotFoundException();

    if (record.isSystem) {
      throw new ReceiptPaymentCategorySystemReadonlyException();
    }

    if (record.organizationId) {
      const member = await this.prismaService.organizationMember.findFirst({
        where: { userId, organizationId: record.organizationId },
        select: { status: true, organizationRole: { select: { code: true } } },
      });
      if (!member) throw new OrganizationNotMemberException();
      if (member.status === ORGANIZATION_MEMBER_STATUS.LOCKED)
        throw new OrganizationMemberLockedException();
      if (member.status === ORGANIZATION_MEMBER_STATUS.ACTIVE) return true;
    }

    if (record.userId && record.userId === userId) return true;

    throw new OrganizationPermissionDeniedException();
  }
}
