import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import storageConfig from 'src/_core/configs/storage.config';

import { LocalDiskStorageService } from './local-disk-storage.service';
import { StorageService } from './storage.service';

@Module({
  // forFeature = expose the 'storage' namespace locally (does NOT read .env — forRoot's job).
  imports: [ConfigModule.forFeature(storageConfig)],
  providers: [
    // ─── Bind the CONTRACT to its driver ────────────────────────────────
    // Plain useClass, because there is exactly one driver. A useFactory switching on an
    // env var would be an abstraction over a one-member set → KISS §5.
    // Adding a second driver is what turns this into a factory — see STORAGE-PATTERN.md.
    { provide: StorageService, useClass: LocalDiskStorageService },
  ],
  // Only the contract is public, so no other module can name a backend.
  exports: [StorageService],
})
export class StorageModule {}
