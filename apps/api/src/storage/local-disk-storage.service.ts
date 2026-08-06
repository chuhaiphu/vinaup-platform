import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';

import storageConfig from 'src/_core/configs/storage.config';

import { StorageService } from './storage.service';

@Injectable()
export class LocalDiskStorageService extends StorageService {
  constructor(
    @Inject(storageConfig.KEY) private readonly storageConf: ConfigType<typeof storageConfig>,
  ) {
    super();
  }

  // Fewer params than the contract is fine: disk has no contentType.
  // The static server infers Content-Type from the file extension in the key.
  async put(key: string, body: Buffer): Promise<void> {
    const filePath = resolve(this.storageConf.localRoot, key);
    // Keys contain slashes (users/{userId}/…) → parent dirs must exist before writeFile.
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, body);
  }

  async delete(key: string): Promise<void> {
    // force: deleting a missing key is a no-op, not an error — a prune must never fail a request.
    await rm(resolve(this.storageConf.localRoot, key), { force: true });
  }

  getPublicUrl(key: string): string {
    return `${this.storageConf.publicBaseUrl}/${key}`;
  }
}
