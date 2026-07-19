import { registerAs } from '@nestjs/config';
import { CookieOptions } from 'express';

import { ONE_DAY, ONE_MINUTE, SEVEN_DAYS } from 'src/_common/constants/time.constant';
import { APP_DOMAIN_PRODUCTION } from 'src/_common/constants/uri.constant';

export interface AuthConfig {
  cookies: {
    accessToken: {
      name: string;
      options: CookieOptions;
    };
    refreshToken: {
      name: string;
      options: CookieOptions;
    };
  };
  jwt: {
    secret: string;
    ttl: number;
  };
  refresh: {
    ttl: number;
  };
}

export default registerAs('auth', (): AuthConfig => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    cookies: {
      accessToken: {
        name: 'atk',
        options: {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? 'strict' : 'lax',
          ...(isProduction ? { domain: APP_DOMAIN_PRODUCTION } : {}),
          maxAge: ONE_DAY,
        },
      },
      refreshToken: {
        name: 'rtk',
        // Path-scope the refresh token to the auth surface only: the browser ships it to
        // every /auth/* route (refresh + logout) but never to business endpoints — so a 7-day
        // secret is not rattled across the whole API, yet still reaches the routes that consume it.
        options: {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? 'strict' : 'lax',
          ...(isProduction ? { domain: APP_DOMAIN_PRODUCTION } : {}),
          maxAge: SEVEN_DAYS,
          path: '/auth',
        },
      },
    },
    jwt: {
      secret: process.env.JWT_SECRET!,
      ttl: ONE_MINUTE * 10,
    },
    refresh: {
      ttl: SEVEN_DAYS,
    },
  };
});
