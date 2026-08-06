import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StorageModule } from 'src/storage/storage.module';
import { TourModule } from 'src/tour/tour.module';

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
    StorageModule,
    AuthModule,
    // ─── TourModule: exports TourImplementationAccessService — the receipt-payment service selects the
    // tour-implementation-access plane for a receipt payment attached to a tour implementation (Flow 3). ───
    TourModule,
    ],
  controllers: [ReceiptPaymentController, ReceiptPaymentCategoryController],
  providers: [ReceiptPaymentService, ReceiptPaymentCategoryService],
})
export class ReceiptPaymentModule {}
