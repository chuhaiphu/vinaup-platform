import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import uploadConfig from 'src/_core/configs/upload.config';
import { AuthModule } from 'src/auth/auth.module';

import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [
    // ─── ConfigModule.forFeature(uploadConfig): expose config locally ─
    // forFeature = register a config namespace for THIS module only,
    // so its token (uploadConfig.KEY) becomes injectable in UploadService.
    // It does NOT read .env — that is forRoot's job (app.module.ts), which must have run first.
    ConfigModule.forFeature(uploadConfig),
    AuthModule,
  ],
  providers: [UploadService],
  controllers: [UploadController],
  // Exported so other modules can inject UploadService directly (e.g. store media as
  // part of another flow), not only via the HTTP route. → MODULE-PATTERN.md
  exports: [UploadService],
})
export class UploadModule {}