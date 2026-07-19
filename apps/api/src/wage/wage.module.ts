import { Module } from '@nestjs/common';

import { ValidatorsModule } from 'src/_core/validators/validators.module';
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
    // Registers the custom class-validator constraints this domain's DTOs use,
    // so class-validator can resolve them at validation time.
    ValidatorsModule,
  ],
  controllers: [WageController],
  providers: [WageService],
})
export class WageModule {}
