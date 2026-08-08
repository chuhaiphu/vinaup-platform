import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';
import { StorageModule } from 'src/storage/storage.module';
import { TourModule } from 'src/tour/tour.module';

import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';

@Module({
  imports: [
    // ─── PrismaModule: make PrismaService injectable in this module
    PrismaModule,
    // ─── StorageModule: make StorageService injectable in this module
    StorageModule,
    // ─── TourModule: TourImplementationAccessGuard on this module's controller injects its service
    TourModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
