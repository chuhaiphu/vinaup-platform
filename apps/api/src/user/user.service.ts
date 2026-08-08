import { Injectable } from '@nestjs/common';
import type {
  UpdateUserRequestInterface,
  UserFilterRequestInterface,
} from '@vinaup-platform/validation';

import { AUTH_PROVIDER } from 'src/_common/constants/auth.constant';
import { EXTENSION_BY_MIME } from 'src/_common/constants/storage.constant';
import {
  DEFAULT_PROJECT_CATEGORIES,
  SYSTEM_RECEIPT_PAYMENT_CATEGORIES,
  USER_STATUS,
} from 'src/_common/constants/user.constant';
import { UploadFailedException } from 'src/_common/exceptions/storage.exception';
import { UserNotFoundException } from 'src/_common/exceptions/user.exception';
import { Prisma } from 'src/prisma/generated/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { StorageService } from 'src/storage/storage.service';

import {
  embeddedUserQueryArgs,
  toEmbeddedUserResponse,
  type UserResponse,
} from './dtos/user.response.dto';


@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  private async getUserOrganizationCounts(userId: string) {
    const [organizationOwnedCount, organizationLinkedCount] = await Promise.all([
      this.prismaService.organization.count({
        where: { createdByUserId: userId },
      }),
      this.prismaService.organizationMember.count({
        where: { userId },
      }),
    ]);
    return {
      organizationOwnedCount,
      organizationLinkedCount,
    };
  }

  // Takes the caller's transaction client so the account, its credential and its default categories
  // either all land or none do — sign-up runs this alongside consuming the OTP row.
  async createUserWithDefaults(
    transaction: Prisma.TransactionClient,
    input: { phone: string; name: string; passwordHash: string }
  ): Promise<UserResponse> {
    const newUser = await transaction.user.create({
      data: {
        phone: input.phone,
        // The OTP already proved the number, so it is verified from the row's first moment.
        phoneVerifiedAt: new Date(),
        name: input.name,
        status: USER_STATUS.ACTIVE,
      },
      ...embeddedUserQueryArgs,
    });
    await transaction.user.update({
      where: { id: newUser.id },
      data: { createdByUserId: newUser.id },
    });
    await transaction.auth.create({
      data: {
        userId: newUser.id,
        provider: AUTH_PROVIDER.LOCAL,
        passwordHash: input.passwordHash,
      },
    });
    await transaction.projectCategory.createMany({
      data: DEFAULT_PROJECT_CATEGORIES.map((name) => ({ name, userId: newUser.id })),
    });
    await transaction.receiptPaymentCategory.createMany({
      data: SYSTEM_RECEIPT_PAYMENT_CATEGORIES.map((name) => ({
        name,
        userId: newUser.id,
        isSystem: true,
      })),
    });

    return {
      ...toEmbeddedUserResponse(newUser, this.storageService),
      organizationOwnedCount: 0,
      organizationLinkedCount: 0,
    };
  }

  async updateUser(
    userId: string,
    updateUserRequest: UpdateUserRequestInterface
  ): Promise<UserResponse> {
    const existingUser = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new UserNotFoundException();
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: updateUserRequest,
      ...embeddedUserQueryArgs,
    });
    const organizationCounts = await this.getUserOrganizationCounts(userId);
    return {
      ...toEmbeddedUserResponse(updatedUser, this.storageService),
      ...organizationCounts,
    };
  }

  async findUserById(userId: string): Promise<UserResponse> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      ...embeddedUserQueryArgs,
    });
    if (!user) {
      throw new UserNotFoundException();
    }
    const organizationCounts = await this.getUserOrganizationCounts(userId);
    return { ...toEmbeddedUserResponse(user, this.storageService), ...organizationCounts };
  }

  async searchUsers(params: UserFilterRequestInterface): Promise<UserResponse[]> {
    const conditions: Prisma.UserWhereInput[] = [];
    if (params.name) {
      conditions.push({ name: { equals: params.name, mode: 'insensitive' } });
    }

    if (params.phone) {
      conditions.push({ phone: { equals: params.phone } });
    }

    if (params.email) {
      conditions.push({ email: { equals: params.email, mode: 'insensitive' } });
    }

    if (conditions.length === 0) {
      return [];
    }

    const users = await this.prismaService.user.findMany({
      where: { OR: conditions },
      orderBy: { name: 'asc' },
      ...embeddedUserQueryArgs,
    });
    const results = await Promise.all(
      users.map(async (user) => ({
        ...toEmbeddedUserResponse(user, this.storageService),
        ...(await this.getUserOrganizationCounts(user.id)),
      }))
    );
    return results;
  }

  async findUserByEmail(
    email: string,
    currentUserId: string
  ): Promise<UserResponse | null> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
      ...embeddedUserQueryArgs,
    });
    if (!user) {
      throw new UserNotFoundException();
    }
    if (user.id === currentUserId) {
      return null;
    }
    const organizationCounts = await this.getUserOrganizationCounts(user.id);
    return { ...toEmbeddedUserResponse(user, this.storageService), ...organizationCounts };
  }

  async updateAvatar(userId: string, file: Express.Multer.File): Promise<UserResponse> {
    const existing = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { avatarKey: true },
    });
    if (!existing) {
      throw new UserNotFoundException();
    }

    // Server-generated key; the extension comes from the VERIFIED mime type, never from the
    // uploaded filename. → docs/pattern/STORAGE-PATTERN.md
    const extension = EXTENSION_BY_MIME[file.mimetype];
    const avatarKey = `users/${userId}/avatar-${Date.now()}.${extension}`;

    try {
      await this.storageService.put(avatarKey, file.buffer, file.mimetype);
    } catch {
      throw new UploadFailedException();
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: { avatarKey },
      ...embeddedUserQueryArgs,
    });

    // Best-effort prune of the previous object — a cleanup failure must NOT fail the request
    if (existing.avatarKey) {
      try {
        await this.storageService.delete(existing.avatarKey);
      } catch {
        // swallow — an orphaned object is a cleanup problem, not a user-facing one
      }
    }

    const organizationCounts = await this.getUserOrganizationCounts(userId);
    return { ...toEmbeddedUserResponse(updatedUser, this.storageService), ...organizationCounts };
  }

  async removeAvatar(userId: string): Promise<UserResponse> {
    const existing = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { avatarKey: true },
    });
    if (!existing) {
      throw new UserNotFoundException();
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: { avatarKey: null },
      ...embeddedUserQueryArgs,
    });

    if (existing.avatarKey) {
      try {
        await this.storageService.delete(existing.avatarKey);
      } catch {
        // swallow — an orphaned object is a cleanup problem, not a user-facing one
      }
    }

    const organizationCounts = await this.getUserOrganizationCounts(userId);
    return { ...toEmbeddedUserResponse(updatedUser, this.storageService), ...organizationCounts };
  }
}
