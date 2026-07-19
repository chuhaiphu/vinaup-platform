import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { SignatureNotAuthorizedException, SignatureNotFoundException } from 'src/_common/exceptions/signature.exception';
import { AuthenticatedRequest } from 'src/_common/interfaces/interface';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SignatureMutationGuard implements CanActivate {
  constructor(
    private prismaService: PrismaService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    if (!user) throw new ForbiddenException('Unauthenticated user');

    const params = request.params as Record<string, unknown> | undefined;
    const body = request.body as Record<string, unknown> | undefined;
    const query = request.query as Record<string, unknown> | undefined;

    const signatureId =
      params?.['id'] ??
      body?.['id'] ??
      query?.['id'];

    if (!signatureId) {
      throw new Error('Field id is required for SignatureMutationGuard');
    }

    const existingSignature = await this.prismaService.signature.findUnique({
      where: { id: signatureId as string },
    });

    if (!existingSignature) {
      throw new SignatureNotFoundException();
    }

    // If targetUserId is specified, only that exact user is allowed
    if (existingSignature.targetUserId !== null && existingSignature.targetUserId !== user.userId) {
      throw new SignatureNotAuthorizedException();
    }

    return true;
  }
}
