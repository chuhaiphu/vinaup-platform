import { Module } from '@nestjs/common';

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
    // ─── PrismaModule: make PrismaService injectable in this module
    PrismaModule,
    // ─── StorageModule: make StorageService injectable in this module
    StorageModule,
  ],
  controllers: [CarController, CarAssignmentController, CarMaintenanceLogController],
  providers: [CarService, CarAssignmentService, CarMaintenanceLogService],
  // Exported for cross-module reuse: other modules can inject these car services
  // directly, not only reach them over HTTP. → MODULE-PATTERN.md
  exports: [CarService, CarAssignmentService, CarMaintenanceLogService],
})
export class CarModule {}
