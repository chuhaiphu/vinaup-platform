import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';
import { StorageModule } from 'src/storage/storage.module';

import { WageController } from './wage.controller';
import { WageService } from './wage.service';

@Module({
  imports: [
    // ─── PrismaModule: make PrismaService injectable in this module
    PrismaModule,
    // ─── StorageModule: make StorageService injectable in this module
    StorageModule,
  ],
  controllers: [WageController],
  providers: [WageService],
})
export class WageModule {}
