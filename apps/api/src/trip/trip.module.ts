import { Module } from '@nestjs/common';

import { ValidatorsModule } from 'src/_core/validators/validators.module';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';

import { TripAssignmentController } from './controllers/trip-assignment.controller';
import { TripController } from './controllers/trip.controller';
import { TripAssignmentService } from './services/trip-assignment.service';
import { TripService } from './services/trip.service';

@Module({
  imports: [
    // ─── PrismaModule: make PrismaService injectable in this module ───────────────
    PrismaModule,
    AuthModule,
    // ─── ValidatorsModule: register the custom request-DTO validators ───
    ValidatorsModule,
  ],
  controllers: [TripController, TripAssignmentController],
  providers: [TripService, TripAssignmentService],
  // Exported for cross-module reuse: other modules can inject these services directly
  exports: [TripService, TripAssignmentService],
})
export class TripModule {}
