import { Module } from '@nestjs/common';

import { ValidatorsModule } from 'src/_core/validators/validators.module';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';

import { ReceiptPaymentCategoryController } from './controllers/receipt-payment-category.controller';
import { ReceiptPaymentController } from './controllers/receipt-payment.controller';
import { ReceiptPaymentCategoryService } from './services/receipt-payment-category.service';
import { ReceiptPaymentService } from './services/receipt-payment.service';

@Module({
  imports: [
    // ─── PrismaModule: make PrismaService injectable in this module ───────────────
    // The receipt-payment services below inject PrismaService for DB access. DI only
    // resolves a dependency whose provider is visible in THIS module's scope — without
    // this import, building the services would fail at startup.
    PrismaModule,
    AuthModule,
    // ─── ValidatorsModule: register the custom request-DTO validators ───
    // Registers the custom class-validator constraints this domain's DTOs use,
    // so class-validator can resolve them at validation time.
    ValidatorsModule,
  ],
  controllers: [ReceiptPaymentController, ReceiptPaymentCategoryController],
  providers: [ReceiptPaymentService, ReceiptPaymentCategoryService],
})
export class ReceiptPaymentModule {}
