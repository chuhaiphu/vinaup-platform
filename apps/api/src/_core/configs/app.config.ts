import { registerAs } from '@nestjs/config';

import { FRONTEND_LOCAL, FRONTEND_PRODUCTION } from 'src/_common/constants/uri.constant';

export interface AppConfig {
  cors: {
    origin: string[];
  };
}

export default registerAs('app', (): AppConfig => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    cors: {
      origin: isProduction ? [FRONTEND_PRODUCTION] : [FRONTEND_LOCAL],
    },
  };
});
