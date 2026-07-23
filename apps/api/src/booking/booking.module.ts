import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TourModule } from 'src/tour/tour.module';

import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';

@Module({
  imports: [
    // ─── PrismaModule: make PrismaService injectable in this module ───────────────
    // BookingService injects PrismaService for DB access.//
    PrismaModule,
    AuthModule,
    TourModule,
    // ─── ValidatorsModule: register the custom request-DTO validators ───
    ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
