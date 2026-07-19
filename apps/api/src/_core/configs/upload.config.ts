import { registerAs } from '@nestjs/config';

import { APP_DOMAIN_PRODUCTION } from 'src/_common/constants/uri.constant';

export interface UploadConfig {
  uploadPath: string;
  mediaBaseUrl: string;
  maxFileSize: number; // bytes
  allowedMimeTypes: string[];
}

export default registerAs('upload', (): UploadConfig => {
  return {
    uploadPath: '/app/public/media',
    mediaBaseUrl: `https://media.${APP_DOMAIN_PRODUCTION}`,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ],
  };
});