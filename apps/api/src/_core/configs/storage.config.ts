import { registerAs } from '@nestjs/config';

import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from 'src/_common/constants/storage.constant';

const STORAGE_DRIVERS = ['local', 'r2'] as const;
const R2_VAR_NAMES = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET'] as const;

export type StorageDriver = (typeof STORAGE_DRIVERS)[number];

export interface StorageConfig {
  driver: StorageDriver;
  publicBaseUrl: string;
  r2: {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
  };
  localRoot: string;
  maxFileSizeBytes: number;
  allowedMimeTypes: string[];
}

/*
  Syntax: `value is StorageDriver` is a Type Predicate (Type Guard).
  - Nature: At runtime, this function simply returns a standard boolean (`true` or `false`).
  - Mechanism: At compile-time, let Typescript know if this function returns `true`, 
    TypeScript will narrows the type of `value` from `string | undefined` down to `StorageDriver`
*/
const isStorageDriver = (value?: string): value is StorageDriver =>
  STORAGE_DRIVERS.includes(value as StorageDriver);

export default registerAs('storage', (): StorageConfig => {
  const driver = process.env.STORAGE_DRIVER;
  const publicBaseUrl = process.env.STORAGE_PUBLIC_BASE_URL;

  // ─── Prove the value belongs to the union before trusting it
  if (!isStorageDriver(driver)) {
    throw new Error(
      `STORAGE_DRIVER: expected one of ${STORAGE_DRIVERS.join(' | ')}, received "${driver ?? ''}"`,
    );
  }

  if (!publicBaseUrl) {
    throw new Error('STORAGE_PUBLIC_BASE_URL: required, received ""');
  }

  // the AWS SDK validates credentials when a command is SENT, not when the client is constructed
  // so the app would boot green and fail on the first upload.
  // This check is a way to prevent that beforehand.
  if (driver === 'r2') {
    const missingR2VarNameList = R2_VAR_NAMES.filter((varName) => !process.env[varName]);
    if (missingR2VarNameList.length > 0) {
      throw new Error(`STORAGE_DRIVER=r2 requires ${missingR2VarNameList.join(', ')}`);
    }
  }

  return {
    driver,
    publicBaseUrl,
    r2: {
      accountId: process.env.R2_ACCOUNT_ID!,
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      bucket: process.env.R2_BUCKET!,
    },
    localRoot: 'storage',
    maxFileSizeBytes: MAX_FILE_SIZE_BYTES,
    allowedMimeTypes: ALLOWED_MIME_TYPES,
  };
});
