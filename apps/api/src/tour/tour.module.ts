import { Module } from '@nestjs/common';

import { ValidatorsModule } from 'src/_core/validators/validators.module';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';

import { TourCalculationController } from './controllers/tour-calculation.controller';
import { TourImplementationAssignmentController } from './controllers/tour-implementation-assignment.controller';
import { TourImplementationController } from './controllers/tour-implementation.controller';
import { TourSettlementController } from './controllers/tour-settlement.controller';
import { TourController } from './controllers/tour.controller';
import { TourCalculationService } from './services/tour-calculation.service';
import { TourImplementationAssignmentService } from './services/tour-implementation-assignment.service';
import { TourImplementationService } from './services/tour-implementation.service';
import { TourSettlementService } from './services/tour-settlement.service';
import { TourService } from './services/tour.service';

@Module({
  imports: [
    // ─── PrismaModule: make PrismaService injectable in this module ───────────────
    // The tour services below inject PrismaService for DB access.
    PrismaModule,
    AuthModule,
    // ─── ValidatorsModule: register the custom request-DTO validators ───
    // Registers the custom class-validator constraints this domain's DTOs use,
    // so class-validator can resolve them at validation time.
    ValidatorsModule,
  ],
  controllers: [
    TourController,
    TourCalculationController,
    TourImplementationController,
    TourImplementationAssignmentController,
    TourSettlementController,
  ],
  providers: [
    TourService,
    TourCalculationService,
    TourImplementationService,
    TourImplementationAssignmentService,
    TourSettlementService,
  ],
})
export class TourModule {}
