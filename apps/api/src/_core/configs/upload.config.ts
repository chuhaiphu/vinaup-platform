import { registerAs } from '@nestjs/config';

import { APP_DOMAIN_PRODUCTION } from 'src/_common/constants/uri.constant';

export interface UploadConfig {
  uploadPath: string;
  mediaBaseUrl: string;
}

export default registerAs('upload', (): UploadConfig => {
  return {
    uploadPath: '/app/public/media',
    mediaBaseUrl: `https://media.${APP_DOMAIN_PRODUCTION}`,
  };
});