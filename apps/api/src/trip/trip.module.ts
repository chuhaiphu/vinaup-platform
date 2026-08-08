import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';
import { StorageModule } from 'src/storage/storage.module';

import { TripAssignmentController } from './controllers/trip-assignment.controller';
import { TripController } from './controllers/trip.controller';
import { TripAssignmentService } from './services/trip-assignment.service';
import { TripService } from './services/trip.service';

@Module({
  imports: [
    // ─── PrismaModule: make PrismaService injectable in this module
    PrismaModule,
    // ─── StorageModule: make StorageService injectable in this module
    StorageModule,
  ],
  controllers: [TripController, TripAssignmentController],
  providers: [TripService, TripAssignmentService],
  // Exported for cross-module reuse: other modules can inject these services directly
  exports: [TripService, TripAssignmentService],
})
export class TripModule {}
