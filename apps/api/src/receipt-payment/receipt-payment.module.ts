import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';
import { StorageModule } from 'src/storage/storage.module';
import { TourModule } from 'src/tour/tour.module';

import { ReceiptPaymentCategoryController } from './controllers/receipt-payment-category.controller';
import { ReceiptPaymentController } from './controllers/receipt-payment.controller';
import { ReceiptPaymentCategoryService } from './services/receipt-payment-category.service';
import { ReceiptPaymentService } from './services/receipt-payment.service';

@Module({
  imports: [
    // ─── PrismaModule: make PrismaService injectable in this module
    PrismaModule,
    // ─── StorageModule: make StorageService injectable in this module
    StorageModule,
    // ─── TourModule: make TourImplementationAccessService injectable in this module
    TourModule,
  ],
  controllers: [ReceiptPaymentController, ReceiptPaymentCategoryController],
  providers: [ReceiptPaymentService, ReceiptPaymentCategoryService],
})
export class ReceiptPaymentModule {}
