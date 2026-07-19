import { Body, Controller, HttpCode, HttpStatus, Inject, Post, Put, Request, Res, UseGuards } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import type { Request as ExpressRequest, Response } from "express";

import { TokenInvalidException } from "src/_common/exceptions/auth.exception";
import type { AuthenticatedRequest, HttpResponse } from "src/_common/interfaces/interface";
import { isMobileRequest } from "src/_common/utils/predicate/is-mobile-request";
import authConfig from "src/_core/configs/auth.config";
import { CurrentUserId } from "src/_core/decorators/current-user-id.decorator";
import { JwtAuthGuard } from "src/_core/guards/jwt-auth.guard";

import { AuthService } from "./auth.service";
import { AuthResponse } from './dtos/auth.response.dto';
import { LocalSignInRequest } from './dtos/local-signin.request.dto';
import type { RefreshTokenResponse } from './dtos/refresh.response.dto';
import { UpdateAuthSecretRequest } from './dtos/update-auth-secret.request.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(authConfig.KEY)
    private readonly authConf: ConfigType<typeof authConfig>
  ) { }

  @Post('local')
  async localSignIn(
    @Request() req: ExpressRequest,
    @Res({ passthrough: true }) response: Response,
    @Body() localSignInReq: LocalSignInRequest
  ): Promise<HttpResponse<AuthResponse | null>> {
    const authResult = await this.authService.localSignIn(localSignInReq, {
      ipAddress: req.ip ?? '',
      userAgent: req.get('user-agent') ?? '',
    })
    if (isMobileRequest(req)) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Authentication completed successfully',
        data: authResult
      }
    }
    else {
      response.cookie(
        this.authConf.cookies.accessToken.name,
        authResult.accessToken,
        this.authConf.cookies.accessToken.options
      )
      response.cookie(
        this.authConf.cookies.refreshToken.name,
        authResult.refreshToken,
        this.authConf.cookies.refreshToken.options
      )

      return {
        statusCode: HttpStatus.OK,
        message: 'Authentication completed successfully',
        data: null
      }
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Request() req: ExpressRequest,
    @Res({ passthrough: true }) response: Response,
    @Body() body: { refreshToken?: string }
  ): Promise<HttpResponse<RefreshTokenResponse | undefined>> {
    // ─── Resolve the refresh token by platform ──────────────────────────
    const rawRefreshToken = isMobileRequest(req)
      ? body?.refreshToken
      : (req.cookies?.[this.authConf.cookies.refreshToken.name] as string | undefined);

    if (!rawRefreshToken) throw new TokenInvalidException('Refresh token is missing');

    const { accessToken } = await this.authService.refreshAccessToken(rawRefreshToken);

    // ─── Deliver the fresh access token per platform ────────────────────
    if (isMobileRequest(req)) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Token refreshed',
        data: { accessToken },
      };
    }

    response.cookie(
      this.authConf.cookies.accessToken.name,
      accessToken,
      this.authConf.cookies.accessToken.options
    );
    return { statusCode: HttpStatus.OK, message: 'Token refreshed' };
  }

  @UseGuards(JwtAuthGuard)
  @Put('secret')
  async updateAuthSecret(
    @Request() req: AuthenticatedRequest,
    @Body() updateAuthSecretRequest: UpdateAuthSecretRequest
  ): Promise<HttpResponse<boolean>> {
    const result = await this.authService.updateAuthSecret(
      req.user.userId,
      updateAuthSecretRequest.provider,
      updateAuthSecretRequest.secret
    )
    return {
      statusCode: HttpStatus.OK,
      message: 'Auth secret updated successfully',
      data: result
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async localSignOut(
    @Request() req: ExpressRequest,
    @Res({ passthrough: true }) response: Response,
    @Body() body: { refreshToken?: string }
  ): Promise<HttpResponse<void>> {
    // ─── Resolve the refresh token by platform ─────────
    const rawRefreshToken = isMobileRequest(req)
      ? body?.refreshToken
      : (req.cookies?.[this.authConf.cookies.refreshToken.name] as string | undefined);

    if (rawRefreshToken) await this.authService.revokeSession(rawRefreshToken);

    // Idempotent: a stale/absent token still clears cookies below and returns 200,
    // so "log out when already logged out" never errors.
    if (!isMobileRequest(req)) this.clearSessionCookies(response);

    return {
      statusCode: HttpStatus.OK,
      message: 'Sign out successful',
    }
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async localSignOutAll(
    @CurrentUserId() userId: string,
    @Request() req: ExpressRequest,
    @Res({ passthrough: true }) response: Response
  ): Promise<HttpResponse<void>> {
    await this.authService.revokeAllSessions(userId);

    if (!isMobileRequest(req)) this.clearSessionCookies(response);

    return {
      statusCode: HttpStatus.OK,
      message: 'Sign out from all devices successful',
    }
  }

  // ─── Clear both session cookies (web only) ──────────────────────────
  // Options must match those used to set each cookie (path included) or the browser keeps it —
  // hence we pass the same options objects the cookies were issued with.
  private clearSessionCookies(response: Response): void {
    response.clearCookie(
      this.authConf.cookies.accessToken.name,
      this.authConf.cookies.accessToken.options
    );
    response.clearCookie(
      this.authConf.cookies.refreshToken.name,
      this.authConf.cookies.refreshToken.options
    );
  }
}
