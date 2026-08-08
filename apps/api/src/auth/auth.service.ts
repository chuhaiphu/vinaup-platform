import { Inject, Injectable } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type {
  LocalSignInRequestInterface,
  RequestSignUpOtpRequestInterface,
  SignUpRequestInterface,
} from '@vinaup-platform/validation';
import { compareSync, hash } from "bcrypt";

import { AUTH_PROVIDER, BCRYPT_COST, VERIFICATION_KIND } from "src/_common/constants/auth.constant";
import {
  InvalidCredentialsException,
  PhoneAlreadyUsedException,
  RefreshTokenInvalidException,
  SignUpOtpInvalidException,
} from "src/_common/exceptions/auth.exception";
import type { JwtPayload } from "src/_common/interfaces/interface";
import { generateOpaqueToken } from "src/_common/utils/generator/string-generator/generate-opaque-token";
import { generateOtpCode } from "src/_common/utils/generator/string-generator/generate-otp-code";
import { generateSha256Hash } from "src/_common/utils/generator/string-generator/generate-sha256-hash";
import authConfig from "src/_core/configs/auth.config";
import { NotifierService } from "src/notifier/notifier.service";
import { Prisma } from "src/prisma/generated/client";
import { PrismaService } from "src/prisma/prisma.service";
import type { UserResponse } from "src/user/dtos/user.response.dto";
import { UserService } from "src/user/user.service";

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
    private readonly notifierService: NotifierService,
    private readonly userService: UserService,
    @Inject(authConfig.KEY)
    private readonly authConf: ConfigType<typeof authConfig>
  ) { }

  // Writes a Verification row and nothing else — no User, no Auth. An abandoned registration
  // therefore leaves one expiring challenge behind and no account.
  async requestSignUpOtp(requestSignUpOtpReq: RequestSignUpOtpRequestInterface): Promise<void> {
    const existingUser = await this.prismaService.user.findUnique({
      where: { phone: requestSignUpOtpReq.phone },
      select: { id: true },
    })
    // Sign-up discloses that a number is taken, unlike the reset flows: a registration form cannot
    // work without confirming availability.
    if (existingUser) { throw new PhoneAlreadyUsedException() }

    // Supersede: exactly one code stays live per number, so resending cannot widen the attempt budget.
    await this.prismaService.verification.updateMany({
      where: {
        kind: VERIFICATION_KIND.SIGN_UP_OTP,
        target: requestSignUpOtpReq.phone,
        consumedAt: null,
      },
      data: { consumedAt: new Date() },
    })

    const code = generateOtpCode();
    await this.prismaService.verification.create({
      data: {
        kind: VERIFICATION_KIND.SIGN_UP_OTP,
        // No account exists yet, so the claim rides on `target` instead of a userId.
        userId: null,
        target: requestSignUpOtpReq.phone,
        tokenHash: generateSha256Hash(code),
        expiresAt: new Date(Date.now() + this.authConf.verification.signUpOtpTtl),
      },
    })

    // Fire-and-forget: the response returns before the SMS arrives, and the code travels on a
    // different channel than the request came in on.
    this.notifierService.sendSignUpOtpToPhone(requestSignUpOtpReq.phone, code);
  }

  async signUp(signUpReq: SignUpRequestInterface): Promise<UserResponse> {
    const verification = await this.prismaService.verification.findFirst({
      where: {
        kind: VERIFICATION_KIND.SIGN_UP_OTP,
        target: signUpReq.phone,
        consumedAt: null,
        expiresAt: { gt: new Date() },
        attempts: { lt: this.authConf.verification.maxAttempts },
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true, tokenHash: true },
    })
    // Missing, consumed, expired and attempt-capped all collapse into one generic failure, so no
    // response tells a caller the row is spent and a fresh one should be triggered.
    if (!verification) { throw new SignUpOtpInvalidException() }

    if (verification.tokenHash !== generateSha256Hash(signUpReq.code)) {
      await this.prismaService.verification.update({
        where: { id: verification.id },
        data: { attempts: { increment: 1 } },
      })
      throw new SignUpOtpInvalidException()
    }

    const passwordHash = await hash(signUpReq.password, BCRYPT_COST)

    try {
      return await this.prismaService.$transaction(async (transaction) => {
        const newUser = await this.userService.createUserWithDefaults(transaction, {
          phone: signUpReq.phone,
          name: signUpReq.name,
          passwordHash,
        })
        await transaction.verification.update({
          where: { id: verification.id },
          data: { consumedAt: new Date() },
        })
        return newUser
      })
    } catch (error) {
      // The number was free when the code was checked but taken before this transaction committed.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new PhoneAlreadyUsedException()
      }
      throw error
    }
  }

  async localSignIn(localSignInReq: LocalSignInRequestInterface, context: SignInContext): Promise<AuthResponse> {
    const user = await this.prismaService.user.findUnique({
      where: { email: localSignInReq.email },
    })
    if (!user) { throw new InvalidCredentialsException() }

    const auth = await this.prismaService.auth.findUnique({
      where: {
        userId_provider: {
          userId: user.id,
          provider: AUTH_PROVIDER.LOCAL
        }
      }
    })

    if (!auth?.passwordHash) { throw new InvalidCredentialsException() }

    const isEqual = compareSync(localSignInReq.password, auth.passwordHash)
    if (!isEqual) { throw new InvalidCredentialsException() }

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
    // ─── Step 1: Resolve the Session by token hash
    const session = await this.prismaService.session.findFirst({
      where: {
        tokenHash: generateSha256Hash(rawRefreshToken),
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: { userId: true },
    });

    // ─── Step 2: If no match or expired or revoked
    if (!session) throw new RefreshTokenInvalidException('Refresh token is invalid or has expired');

    // ─── Step 3: Else issue a fresh access token
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
}
