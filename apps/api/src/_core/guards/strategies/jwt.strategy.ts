import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtPayload, JwtValidationReturn } from 'src/_common/interfaces/interface';
import authConfig from 'src/_core/configs/auth.config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(authConfig.KEY)
    authConf: ConfigType<typeof authConfig>,
    private prismaService: PrismaService,
  ) {
    // ─── Step 1: Capture cookie name before super()
    // super() is called before `this` is available, so we capture the cookie
    // name in a local variable to use inside the extractor closure.
    const cookieName = authConf.cookies.accessToken.name;
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Bearer token from Mobile App request header
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        // Cookie from Web App request header
        (request: Request): string | null =>
          (request.cookies[cookieName] as string) || null,
      ]),
      ignoreExpiration: false,
      secretOrKey: authConf.jwt.secret,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtValidationReturn | null> {
    const user = await this.prismaService.user.findUnique({
      where: { id: payload.sub },
      select: { id: true },
    });

    if (!user) return null;

    return { userId: payload.sub };
  }
}
