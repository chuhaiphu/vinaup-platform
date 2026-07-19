import { Module } from '@nestjs/common';

import { ValidatorsModule } from 'src/_core/validators/validators.module';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';

import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';

@Module({
  imports: [
    // ─── PrismaModule: make PrismaService injectable in this module ───────────────
    // InvoiceService injects PrismaService for DB access.//
    PrismaModule,
    AuthModule,
    // ─── ValidatorsModule: register the custom request-DTO validators ───
    // Registers the custom class-validator constraints this domain's DTOs use,
    // so class-validator can resolve them at validation time.
    ValidatorsModule,
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService],
})
export class InvoiceModule {}
