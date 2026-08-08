import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';
import { StorageModule } from 'src/storage/storage.module';

import { SocialLinkController } from './social-link.controller';
import { SocialLinkService } from './social-link.service';

@Module({
  imports: [
    // ─── PrismaModule: make PrismaService injectable in this module
    PrismaModule,
    // ─── StorageModule: make StorageService injectable in this module
    StorageModule,
  ],
  controllers: [SocialLinkController],
  providers: [SocialLinkService],
})
export class SocialLinkModule {}
