import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';

import { FuelPriceController } from './fuel-price.controller';
import { FuelPriceService } from './fuel-price.service';

@Module({
  imports: [
    // ─── PrismaModule: make PrismaService injectable in this module
    PrismaModule,
  ],
  controllers: [FuelPriceController],
  providers: [FuelPriceService],
})
export class FuelPriceModule {}
