import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';

import { StorageDriverNotIntegratedException } from 'src/_common/exceptions/storage.exception';
import storageConfig from 'src/_core/configs/storage.config';

import { StorageService } from './storage.service';

// ─── DRIVER — Cloudflare R2, not integrated yet ──────────────────────
// The seam is real: the class is registered and the factory returns it for STORAGE_DRIVER=r2.
// Writes throw until an S3Client is wired behind them — see STORAGE-PATTERN.md.
@Injectable()
export class R2StorageService extends StorageService {
  private readonly logger = new Logger(R2StorageService.name);

  constructor(
    @Inject(storageConfig.KEY) private readonly storageConf: ConfigType<typeof storageConfig>,
  ) {
    super();
  }

  put(key: string): Promise<void> {
    this.logger.error(`${R2StorageService.name} is not integrated — ${key} was not stored`);
    return Promise.reject(new StorageDriverNotIntegratedException());
  }

  delete(key: string): Promise<void> {
    this.logger.error(`${R2StorageService.name} is not integrated — ${key} was not deleted`);
    return Promise.reject(new StorageDriverNotIntegratedException());
  }

  // Real — deriving a URL needs no client.
  getPublicUrl(key: string): string {
    return `${this.storageConf.publicBaseUrl}/${key}`;
  }
}
