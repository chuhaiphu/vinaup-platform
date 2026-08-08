import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type {
  ForgotPasswordOtpRequestInterface,
  LinkEmailRequestInterface,
  LocalSignInRequestInterface,
  OtpSignInRequestInterface,
  RequestLinkEmailRequestInterface,
  RequestOtpSignInRequestInterface,
  RequestSignUpOtpRequestInterface,
  ResetPasswordOtpRequestInterface,
  SignUpRequestInterface,
} from '@vinaup-platform/validation';
import { compare, hash } from 'bcrypt';

import {
  AUTH_PROVIDER,
  BCRYPT_COST,
  VERIFICATION_KIND,
  type VerificationKind,
} from 'src/_common/constants/auth.constant';
import { USER_STATUS } from 'src/_common/constants/user.constant';
import {
  AccountDisabledException,
  CurrentPasswordInvalidException,
  EmailAlreadyLinkedException,
  EmailAlreadyUsedException,
  EmailVerificationInvalidException,
  InvalidCredentialsException,
  PhoneAlreadyUsedException,
  RefreshTokenInvalidException,
  ResetTokenInvalidException,
  SignInOtpInvalidException,
  SignUpOtpInvalidException,
} from 'src/_common/exceptions/auth.exception';
import type { JwtPayload } from 'src/_common/interfaces/interface';
import { generateOpaqueToken } from 'src/_common/utils/generator/string-generator/generate-opaque-token';
import { generateOtpCode } from 'src/_common/utils/generator/string-generator/generate-otp-code';
import { generateSha256Hash } from 'src/_common/utils/generator/string-generator/generate-sha256-hash';
import authConfig from 'src/_core/configs/auth.config';
import { NotifierService } from 'src/notifier/notifier.service';
import { Prisma } from 'src/prisma/generated/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { StorageService } from 'src/storage/storage.service';
import {
  embeddedUserQueryArgs,
  toEmbeddedUserResponse,
  type UserResponse,
} from 'src/user/dtos/user.response.dto';
import { UserService } from 'src/user/user.service';

import type { AuthResponse } from './dtos/auth.response.dto';

// Per-sign-in client metadata
interface SignInContext {
  ipAddress: string;
  userAgent: string;
}

// Sign-up is the only kind with no account yet, so it is the only one anchored on `target`.
type VerificationAnchor = { userId: string } | { target: string };

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private readonly notifierService: NotifierService,
    private readonly userService: UserService,
    private readonly storageService: StorageService,
    @Inject(authConfig.KEY)
    private readonly authConf: ConfigType<typeof authConfig>,
  ) {}

  async requestSignUpOtp(requestSignUpOtpReq: RequestSignUpOtpRequestInterface): Promise<void> {
    const existingUser = await this.prismaService.user.findUnique({
      where: { phone: requestSignUpOtpReq.phone },
      select: { id: true },
    });
    if (existingUser) {
      throw new PhoneAlreadyUsedException();
    }
    const code = await this.issueOtpVerification(
      VERIFICATION_KIND.SIGN_UP_OTP,
      { target: requestSignUpOtpReq.phone },
      { ttl: this.authConf.verification.signUpOtpTtl },
    );

    // Fire-and-forget: the response returns before the SMS arrives.
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
    });

    if (!verification) {
      throw new SignUpOtpInvalidException();
    }

    if (verification.tokenHash !== generateSha256Hash(signUpReq.code)) {
      await this.prismaService.verification.update({
        where: { id: verification.id },
        data: { attempts: { increment: 1 } },
      });
      throw new SignUpOtpInvalidException();
    }

    const passwordHash = await hash(signUpReq.password, BCRYPT_COST);

    try {
      return await this.prismaService.$transaction(async (transaction) => {
        const newUser = await this.userService.createUserWithDefaults(transaction, {
          phone: signUpReq.phone,
          name: signUpReq.name,
          passwordHash,
        });
        await transaction.verification.update({
          where: { id: verification.id },
          data: { consumedAt: new Date() },
        });
        return newUser;
      });
    } catch (error) {
      // Race condition: the number was free when the code was checked but taken before this transaction committed.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new PhoneAlreadyUsedException();
      }
      throw error;
    }
  }

  async localSignIn(
    localSignInReq: LocalSignInRequestInterface,
    context: SignInContext,
  ): Promise<AuthResponse> {
    // An "@" cannot appear in a phone number nor be absent from an email, so one lookup settles it.
    // Both identities resolve to the same User and the same single Auth(LOCAL) credential.
    const isEmailIdentifier = localSignInReq.identifier.includes('@');
    const user = await this.prismaService.user.findUnique({
      where: isEmailIdentifier
        ? { email: localSignInReq.identifier }
        : { phone: localSignInReq.identifier },
      select: { ...embeddedUserQueryArgs.select, status: true },
    });
    if (!user) {
      throw new InvalidCredentialsException();
    }

    const auth = await this.prismaService.auth.findUnique({
      where: {
        userId_provider: {
          userId: user.id,
          provider: AUTH_PROVIDER.LOCAL,
        },
      },
    });

    if (!auth?.passwordHash) {
      throw new InvalidCredentialsException();
    }

    const isEqual = await compare(localSignInReq.password, auth.passwordHash);
    if (!isEqual) {
      throw new InvalidCredentialsException();
    }

    const { status, ...embeddedUser } = user;
    if (status === USER_STATUS.DISABLED) {
      throw new AccountDisabledException();
    }

    const { accessToken, refreshToken } = await this.issueTokens(user.id, context);

    return {
      accessToken,
      refreshToken,
      user: toEmbeddedUserResponse(embeddedUser, this.storageService),
    };
  }

  async requestOtpSignIn(requestOtpSignInReq: RequestOtpSignInRequestInterface): Promise<void> {
    const user = await this.prismaService.user.findUnique({
      where: { phone: requestOtpSignInReq.phone },
      select: { id: true, status: true },
    });
    if (!user || user.status === USER_STATUS.DISABLED) {
      return;
    }

    const code = await this.issueOtpVerification(
      VERIFICATION_KIND.SIGN_IN_OTP,
      { userId: user.id },
      { ttl: this.authConf.verification.signInOtpTtl },
    );

    this.notifierService.sendSignInOtpToPhone(requestOtpSignInReq.phone, code);
  }

  async otpSignIn(otpSignInReq: OtpSignInRequestInterface, context: SignInContext): Promise<AuthResponse> {
    const user = await this.prismaService.user.findUnique({
      where: { phone: otpSignInReq.phone },
      select: { ...embeddedUserQueryArgs.select, status: true },
    });
    // An unregistered number fails exactly like a wrong code, so verify leaks nothing request withheld.
    if (!user) {
      throw new SignInOtpInvalidException();
    }

    const verification = await this.prismaService.verification.findFirst({
      where: {
        kind: VERIFICATION_KIND.SIGN_IN_OTP,
        userId: user.id,
        consumedAt: null,
        expiresAt: { gt: new Date() },
        attempts: { lt: this.authConf.verification.maxAttempts },
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true, tokenHash: true },
    });
    if (!verification) {
      throw new SignInOtpInvalidException();
    }

    if (verification.tokenHash !== generateSha256Hash(otpSignInReq.code)) {
      await this.prismaService.verification.update({
        where: { id: verification.id },
        data: { attempts: { increment: 1 } },
      });
      throw new SignInOtpInvalidException();
    }

    const { status, ...embeddedUser } = user;
    // Re-checked here in case an account can be disabled inside the code's 5-minute window.
    if (status === USER_STATUS.DISABLED) {
      throw new AccountDisabledException();
    }

    await this.prismaService.verification.update({
      where: { id: verification.id },
      data: { consumedAt: new Date() },
    });

    const { accessToken, refreshToken } = await this.issueTokens(user.id, context);

    return {
      accessToken,
      refreshToken,
      user: toEmbeddedUserResponse(embeddedUser, this.storageService),
    };
  }

  async requestLinkEmail(
    userId: string,
    requestLinkEmailReq: RequestLinkEmailRequestInterface,
  ): Promise<void> {

    const auth = await this.prismaService.auth.findUnique({
      where: { userId_provider: { userId, provider: AUTH_PROVIDER.LOCAL } },
      select: { passwordHash: true },
    });
    if (!auth?.passwordHash) {
      throw new CurrentPasswordInvalidException();
    }
    if (!(await compare(requestLinkEmailReq.currentPassword, auth.passwordHash))) {
      throw new CurrentPasswordInvalidException();
    }

    const caller = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    // Changing a linked address is a separate flow, so a second link is a conflict, not an overwrite.
    if (caller?.email) {
      throw new EmailAlreadyLinkedException();
    }

    const emailOwner = await this.prismaService.user.findUnique({
      where: { email: requestLinkEmailReq.email },
      select: { id: true },
    });
    if (emailOwner) {
      throw new EmailAlreadyUsedException();
    }

    const code = await this.issueOtpVerification(
      VERIFICATION_KIND.EMAIL_VERIFICATION,
      { userId },
      {
        ttl: this.authConf.verification.emailVerificationOtpTtl,
        target: requestLinkEmailReq.email,
      },
    );

    this.notifierService.sendEmailVerificationOtp(requestLinkEmailReq.email, code);
  }

  async linkEmail(userId: string, linkEmailReq: LinkEmailRequestInterface): Promise<void> {
    const verification = await this.prismaService.verification.findFirst({
      where: {
        kind: VERIFICATION_KIND.EMAIL_VERIFICATION,
        userId,
        consumedAt: null,
        expiresAt: { gt: new Date() },
        attempts: { lt: this.authConf.verification.maxAttempts },
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true, target: true, tokenHash: true },
    });

    // `target` is the email address under challenge.
    if (!verification?.target) {
      throw new EmailVerificationInvalidException();
    }

    if (verification.tokenHash !== generateSha256Hash(linkEmailReq.code)) {
      await this.prismaService.verification.update({
        where: { id: verification.id },
        data: { attempts: { increment: 1 } },
      });
      throw new EmailVerificationInvalidException();
    }

    const emailOwner = await this.prismaService.user.findUnique({
      where: { email: verification.target },
      select: { id: true },
    });
    if (emailOwner) {
      throw new EmailAlreadyUsedException();
    }

    try {
      await this.prismaService.$transaction(async (transaction) => {
        await transaction.user.update({
          where: { id: userId },
          data: { email: verification.target, emailVerifiedAt: new Date() },
        });
        await transaction.verification.update({
          where: { id: verification.id },
          data: { consumedAt: new Date() },
        });
      });
    } catch (error) {
      // Race condition: the address was free at the check above but taken before this committed.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new EmailAlreadyUsedException();
      }
      throw error;
    }
  }

  async forgotPasswordOtp(forgotPasswordOtpReq: ForgotPasswordOtpRequestInterface): Promise<void> {
    const user = await this.prismaService.user.findUnique({
      where: { email: forgotPasswordOtpReq.email },
      select: { id: true, status: true },
    });

    if (!user || user.status === USER_STATUS.DISABLED) {
      return;
    }

    const auth = await this.prismaService.auth.findUnique({
      where: { userId_provider: { userId: user.id, provider: AUTH_PROVIDER.LOCAL } },
      select: { passwordHash: true },
    });

    if (!auth?.passwordHash) {
      return;
    }

    const code = await this.issueOtpVerification(
      VERIFICATION_KIND.PASSWORD_RESET_EMAIL_OTP,
      { userId: user.id },
      { ttl: this.authConf.verification.passwordResetOtpTtl },
    );

    this.notifierService.sendPasswordResetOtpToEmail(forgotPasswordOtpReq.email, code);
  }

  async resetPasswordOtp(resetPasswordOtpReq: ResetPasswordOtpRequestInterface): Promise<void> {
    const user = await this.prismaService.user.findUnique({
      where: { email: resetPasswordOtpReq.email },
      select: { id: true },
    });

    if (!user) {
      throw new ResetTokenInvalidException();
    }

    const verification = await this.prismaService.verification.findFirst({
      where: {
        kind: VERIFICATION_KIND.PASSWORD_RESET_EMAIL_OTP,
        userId: user.id,
        consumedAt: null,
        expiresAt: { gt: new Date() },
        attempts: { lt: this.authConf.verification.maxAttempts },
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true, tokenHash: true },
    });

    if (!verification) {
      throw new ResetTokenInvalidException();
    }

    if (verification.tokenHash !== generateSha256Hash(resetPasswordOtpReq.code)) {
      await this.prismaService.verification.update({
        where: { id: verification.id },
        data: { attempts: { increment: 1 } },
      });
      throw new ResetTokenInvalidException();
    }

    // Hashed outside the transaction: bcrypt is slow and would hold a connection open.
    const passwordHash = await hash(resetPasswordOtpReq.newPassword, BCRYPT_COST);

    // Rotate, consume, revoke — one transaction.
    await this.prismaService.$transaction(async (transaction) => {
      await transaction.auth.update({
        where: { userId_provider: { userId: user.id, provider: AUTH_PROVIDER.LOCAL } },
        data: { passwordHash },
      });
      await transaction.verification.update({
        where: { id: verification.id },
        data: { consumedAt: new Date() },
      });
      await this.revokeAllSessions(user.id, transaction);
    });
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

  // Why `updateMany`, not `update`:
  //   • Because Prisma's `update` only accepts a UNIQUE field in `where` (`@id` or an `@unique`/compound-unique).
  //     We filter by `tokenHash`, a plain non-unique String column, so we will lost type-check.
  //
  //   • If we forced `update` — first `findFirst({ where: { tokenHash } })`
  //     to read the row's `id`, then `update({ where: { id } })`,
  //     the cost would be two DB round-trips.
  //
  //   • "updateMany" is not a risk here — the hash is SHA-256 of a 256-bit random token,
  //     so it matches exactly 1 row in practice.
  async revokeSession(rawRefreshToken: string): Promise<void> {
    await this.prismaService.session.updateMany({
      where: { tokenHash: generateSha256Hash(rawRefreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllSessions(
    userId: string,
    client: Prisma.TransactionClient = this.prismaService
  ): Promise<void> {
    await client.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async issueOtpVerification(
    kind: VerificationKind,
    anchor: VerificationAnchor,
    options: { ttl: number; target?: string },
  ): Promise<string> {
    await this.prismaService.verification.updateMany({
      where: { kind, ...anchor, consumedAt: null },
      data: { consumedAt: new Date() },
    });

    const code = generateOtpCode();
    await this.prismaService.verification.create({
      data: {
        kind,
        userId: 'userId' in anchor ? anchor.userId : null,
        target: 'target' in anchor ? anchor.target : (options.target ?? null),
        tokenHash: generateSha256Hash(code),
        expiresAt: new Date(Date.now() + options.ttl),
      },
    });

    return code;
  }

  private async issueTokens(
    userId: string,
    context: SignInContext,
  ): Promise<{ accessToken: string; refreshToken: string }> {
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
      // jsonwebtoken expects seconds.
      expiresIn: this.authConf.jwt.ttl / 1000,
    });
  }
}
