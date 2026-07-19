import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';

import { WageController } from './wage.controller';
import { WageService } from './wage.service';

@Module({
  imports: [
    // ─── PrismaModule: make PrismaService injectable in this module ───────────────
    // WageService injects PrismaService for DB access.//
    PrismaModule,
    AuthModule,
    // ─── ValidatorsModule: register the custom request-DTO validators ───
    ],
  controllers: [WageController],
  providers: [WageService],
})
export class WageModule {}
