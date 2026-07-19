import { Inject, Injectable } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { LocalSignInRequestInterface } from '@vinaup-platform/validation';
import { compareSync } from "bcrypt";

import { AUTH_PROVIDER } from "src/_common/constants/auth.constant";
import { AuthProviderNotFoundException, InvalidCredentialsException, TokenInvalidException } from "src/_common/exceptions/auth.exception";
import type { JwtPayload } from "src/_common/interfaces/interface";
import { generateOpaqueToken } from "src/_common/utils/generator/string-generator/generate-opaque-token";
import { generateSha256Hash } from "src/_common/utils/generator/string-generator/generate-sha256-hash";
import authConfig from "src/_core/configs/auth.config";
import { PrismaService } from "src/prisma/prisma.service";

import type { AuthResponse } from './dtos/auth.response.dto';

// Per-sign-in client metadata
interface SignInContext {
  ipAddress: string;
  userAgent: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    @Inject(authConfig.KEY)
    private readonly authConf: ConfigType<typeof authConfig>
  ) { }

  async localSignIn(localSignInReq: LocalSignInRequestInterface, context: SignInContext): Promise<AuthResponse> {
    const auth = await this.prismaService.auth.findUnique({
      where: {
        provider_providerId: {
          provider: AUTH_PROVIDER.LOCAL,
          providerId: localSignInReq.email
        }
      }
    })
    if (!auth) { throw new InvalidCredentialsException() }

    const isEqual = compareSync(localSignInReq.password, auth.passwordHash)
    if (!isEqual) { throw new InvalidCredentialsException() }

    const user = await this.prismaService.user.findUnique({
      where: { id: auth.userId },
    })
    // Auth row exists but the User row is gone — an inconsistent state. Surface it as the
    // generic credentials failure so sign-in never leaks which half of the pair is missing.
    if (!user) {
      throw new InvalidCredentialsException()
    }

    const { accessToken, refreshToken } = await this.issueTokens(auth.userId, context)

    const [organizationOwnedCount, organizationLinkedCount] = await Promise.all([
      this.prismaService.organization.count({
        where: { createdByUserId: auth.userId },
      }),
      this.prismaService.organizationMember.count({
        where: { userId: auth.userId },
      }),
    ]);
    const organizations = await this.prismaService.organization.findMany({
      where: {
        organizationMembers: { some: { userId: auth.userId } }
      }
    })
    return {
      accessToken,
      refreshToken,
      user: { ...user, organizationOwnedCount, organizationLinkedCount },
      organizations,
    };
  }

  async refreshAccessToken(rawRefreshToken: string): Promise<{ accessToken: string }> {
    // ─── Step 1: Resolve the Session by token hash ──────────────────────
    const session = await this.prismaService.session.findFirst({
      where: {
        tokenHash: generateSha256Hash(rawRefreshToken),
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: { userId: true },
    });

    // ─── Step 2: If no match or expired or revoked ─────────────────────
    if (!session) throw new TokenInvalidException('Refresh token is invalid or has expired');

    // ─── Step 3: Else issue a fresh access token ───────────────────────────
    return { accessToken: await this.signAccessToken(session.userId) };
  }

  // Soft-revoke the single session behind this refresh token.
  // Why `updateMany`, not `update`:
  //
  //   • Because Prisma's `update` only accepts a UNIQUE field in `where` (`@id` or an `@unique`/compound-unique).
  //     We filter by `tokenHash`, a plain non-unique String column, so we will lost type-check.
  //
  //   • If we forced `update` — first `findFirst({ where: { tokenHash } })`
  //     to read the row's `id`, then `update({ where: { id } })`,
  //     the cost would be two DB round-trips.
  //
  //   • "Many" is not a risk here — the hash is SHA-256 of a 256-bit random token,
  //     so it matches exactly 1 row in practice.
  async revokeSession(rawRefreshToken: string): Promise<void> {
    await this.prismaService.session.updateMany({
      where: { tokenHash: generateSha256Hash(rawRefreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllSessions(userId: string): Promise<void> {
    await this.prismaService.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async issueTokens(userId: string, context: SignInContext): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.signAccessToken(userId);

    const refreshToken = generateOpaqueToken();
    await this.prismaService.session.create({
      data: {
        userId,
        tokenHash: generateSha256Hash(refreshToken),
        expiresAt: new Date(Date.now() + this.authConf.refresh.ttl),
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      },
    });

    return { accessToken, refreshToken };
  }

  private signAccessToken(userId: string): Promise<string> {
    const payload: JwtPayload = { sub: userId };
    return this.jwtService.signAsync(payload, {
      secret: this.authConf.jwt.secret,
      // jsonwebtoken expects seconds; the config stores milliseconds.
      expiresIn: this.authConf.jwt.ttl / 1000,
    });
  }

  async updateAuthSecret(userId: string, provider: string, newSecret: string): Promise<boolean> {
    const existingAuthProvider = await this.prismaService.auth.findUnique({
      where: {
        userId_provider: {
          userId,
          provider
        }
      }
    })
    if (!existingAuthProvider) {
      throw new AuthProviderNotFoundException()
    }
    await this.prismaService.auth.update({
      data: {
        passwordHash: newSecret
      },
      where: {
        userId_provider: {
          userId,
          provider
        }
      }
    })
    return true;
  }
}
