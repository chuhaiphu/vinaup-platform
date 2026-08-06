import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StorageModule } from 'src/storage/storage.module';

import { CarAssignmentController } from './controllers/car-assignment.controller';
import { CarMaintenanceLogController } from './controllers/car-maintenance-log.controller';
import { CarController } from './controllers/car.controller';
import { CarAssignmentService } from './services/car-assignment.service';
import { CarMaintenanceLogService } from './services/car-maintenance-log.service';
import { CarService } from './services/car.service';

@Module({
  imports: [
    // ─── PrismaModule: make PrismaService injectable in this module ───────────────
    // The car services below inject PrismaService for DB access. DI only resolves a
    // dependency whose provider is visible in THIS module's scope — without this
    // import, building the services would fail at startup.
    PrismaModule,
    StorageModule,
    AuthModule,
    // ─── ValidatorsModule: register the custom request-DTO validators ───
    ],
  controllers: [CarController, CarAssignmentController, CarMaintenanceLogController],
  providers: [CarService, CarAssignmentService, CarMaintenanceLogService],
  // Exported for cross-module reuse: other modules can inject these car services
  // directly, not only reach them over HTTP. → MODULE-PATTERN.md
  exports: [CarService, CarAssignmentService, CarMaintenanceLogService],
})
export class CarModule {}
