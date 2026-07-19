import { Injectable } from '@nestjs/common';
import { genSalt, hash } from 'bcrypt';

import { AUTH_PROVIDER } from 'src/_common/constants/auth.constant';
import { AuthExistedException } from 'src/_common/exceptions/auth.exception';
import { UserNotFoundException } from 'src/_common/exceptions/user.exception';
import { Prisma } from 'src/prisma/generated/client';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreateUserRequest } from './dtos/create-user.request.dto';
import { UpdateUserRequest } from './dtos/update-user.request.dto';
import { UserFilterParam } from './dtos/user-filter.param.dto';
import { UserResponse } from './dtos/user.response.dto';


const SYSTEM_RECEIPT_PAYMENT_CATEGORIES = [
  'Hoa hồng', 'Tạm ứng', 'Đặt cọc',
  'Hoàn ứng', 'Trả góp', 'Mượn nợ', 'Trả nợ',
];

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

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
  async signUp(createUserReq: CreateUserRequest): Promise<UserResponse> {
    const { password, ...createUserData } = createUserReq;
    const isAuthExisted = await this.prismaService.auth.findFirst({
      where: { providerId: createUserReq.email },
    });
    if (isAuthExisted)
      throw new AuthExistedException(
        'User already has authentication provider or already existed'
      );

    const newUser = await this.prismaService.user.create({
      data: createUserData,
    });
    await this.prismaService.user.update({
      where: { id: newUser.id },
      data: { createdByUserId: newUser.id },
    });
    const hashedPassword = await hash(password, await genSalt());
    await this.prismaService.auth.create({
      data: {
        providerId: createUserReq.email,
        provider: AUTH_PROVIDER.LOCAL,
        passwordHash: hashedPassword,
        userId: newUser.id,
      },
    });
    await this.prismaService.projectCategory.create({
      data: { name: 'Tiền công', userId: newUser.id },
    });
    await this.prismaService.projectCategory.create({
      data: { name: 'Dự án', userId: newUser.id },
    });
    await this.prismaService.receiptPaymentCategory.createMany({
      data: SYSTEM_RECEIPT_PAYMENT_CATEGORIES.map((name) => ({
        name,
        userId: newUser.id,
        isSystem: true,
      })),
      skipDuplicates: true,
    });

    return {
      ...newUser,
      organizationOwnedCount: 0,
      organizationLinkedCount: 0,
    };
  }

  async updateUser(
    userId: string,
    updateUserRequest: UpdateUserRequest
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
    });
    const organizationCounts = await this.getUserOrganizationCounts(userId);
    return {
      ...updatedUser,
      ...organizationCounts,
    };
  }

  async findUserById(userId: string): Promise<UserResponse> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new UserNotFoundException();
    }
    const organizationCounts = await this.getUserOrganizationCounts(userId);
    return { ...user, ...organizationCounts };
  }

  async searchUsers(params: UserFilterParam): Promise<UserResponse[]> {
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
    });
    const results = await Promise.all(
      users.map(async (user) => ({
        ...user,
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
    });
    if (!user) {
      throw new UserNotFoundException();
    }
    if (user.id === currentUserId) {
      return null;
    }
    const organizationCounts = await this.getUserOrganizationCounts(user.id);
    return { ...user, ...organizationCounts };
  }

}
