import { registerAs } from '@nestjs/config';

import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from 'src/_common/constants/storage.constant';

export interface StorageConfig {
  publicBaseUrl: string;
  localRoot: string;
  maxFileSizeBytes: number;
  allowedMimeTypes: string[];
}

export default registerAs('storage', (): StorageConfig => {
  return {
    publicBaseUrl: process.env.STORAGE_PUBLIC_BASE_URL!,
    localRoot: 'storage',
    // Upload policy — the single code-owned source lives in storage.constant (imported above),
    maxFileSizeBytes: MAX_FILE_SIZE_BYTES,
    allowedMimeTypes: ALLOWED_MIME_TYPES,
  };
});
