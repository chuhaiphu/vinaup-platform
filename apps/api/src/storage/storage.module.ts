import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import storageConfig, { StorageConfig } from 'src/_core/configs/storage.config';

import { LocalDiskStorageService } from './local-disk-storage.service';
import { R2StorageService } from './r2-storage.service';
import { StorageService } from './storage.service';

@Module({
  // forFeature = expose the 'storage' namespace locally (does NOT read .env — forRoot's job).
  imports: [ConfigModule.forFeature(storageConfig)],
  providers: [
    // Every candidate, so the container can construct them.
    LocalDiskStorageService,
    R2StorageService,

    // ─── Bind the CONTRACT to one driver, chosen by config
    {
      provide: StorageService,
      useFactory: (
        config: StorageConfig,
        local: LocalDiskStorageService,
        r2: R2StorageService,
      ): StorageService => {
        switch (config.driver) {
          case 'local':
            return local;
          case 'r2':
            return r2;
        }
      },
      inject: [storageConfig.KEY, LocalDiskStorageService, R2StorageService],
    },
  ],
  // Only the contract is public, so no other module can name a backend.
  exports: [StorageService],
})
export class StorageModule {}
