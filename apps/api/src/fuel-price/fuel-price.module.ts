import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';

import { FuelPriceController } from './fuel-price.controller';
import { FuelPriceService } from './fuel-price.service';

@Module({
  imports: [
    // ─── PrismaModule: make PrismaService injectable in this module ───────────────
    // FuelPriceService injects PrismaService for DB access; without this import,
    // building it would fail at startup.
    PrismaModule,
    AuthModule,
  ],
  controllers: [FuelPriceController],
  providers: [FuelPriceService],
})
export class FuelPriceModule {}
