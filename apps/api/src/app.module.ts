import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';

import appConfig from './_core/configs/app.config';
import authConfig from './_core/configs/auth.config';
import storageConfig from './_core/configs/storage.config';
import { AppExceptionFilter } from './_core/filters/app-exception.filter';
import { AuthExceptionFilter } from './_core/filters/auth-exception.filter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AttendanceModule } from './attendance/attendance.module';
import { BookingModule } from './booking/booking.module';
import { CarModule } from './car/car.module';
import { FuelPriceModule } from './fuel-price/fuel-price.module';
import { InvoiceModule } from './invoice/invoice.module';
import { OrganizationModule } from './organization/organization.module';
import { ProjectModule } from './project/project.module';
import { ReceiptPaymentModule } from './receipt-payment/receipt-payment.module';
import { SignatureModule } from './signature/signature.module';
import { SocialLinkModule } from './social-link/social-link.module';
import { TourModule } from './tour/tour.module';
import { TripModule } from './trip/trip.module';
import { UserModule } from './user/user.module';
import { WageModule } from './wage/wage.module';

@Module({
  imports: [
    UserModule,
    ReceiptPaymentModule,
    // ─── ConfigModule.forRoot(): bootstrap config ONCE, at the root ─────
    // "bootstrap" = the one-time setup NestJS runs at startup before any request.
    //
    // What forRoot does here, in order:
    //   1. Reads the .env file and copies its keys into process.env
    //      (the ONLY step that touches .env — forFeature never reads it).
    //   2. Runs the `load` factories (appConfig, authConfig),
    //      stores their results in the shared "config host",
    //      the single object every ConfigService reads from.
    //
    // The two options passed:
    //   • isGlobal: true = other modules can inject config WITHOUT importing ConfigModule.
    //   • load: [...]    = which namespaced configs to load at boot.
    //
    // WHY it must run first:
    // Without forRoot → .env never read → forFeature config values are undefined.
    //
    // storageConfig is loaded HERE to mount static assets outside production.
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, storageConfig],
    }),
    ProjectModule,
    TourModule,
    InvoiceModule,
    OrganizationModule,
    SocialLinkModule,
    SignatureModule,
    BookingModule,
    CarModule,
    TripModule,
    WageModule,
    FuelPriceModule,
    AttendanceModule,
    ],
  controllers: [AppController],
  providers: [
    AppService,
    // ─── Class provider bound to the APP_FILTER token: a GLOBAL filter ───
    //
    //   • provide  = APP_FILTER = a special token NestJS watches for.
    //                Any filter registered under it catches matching exceptions on EVERY route.
    //                We no need to put @UseFilters on each controller.
    //   • useClass = the class NestJS instantiates THROUGH the DI container,
    //                so its constructor param (authConfig — needed to clear the cookie) gets injected.
    //
    // WHY register here (not app.useGlobalFilters(new AuthExceptionFilter()) in main.ts):
    // Because it will bypass DI and CANNOT receive authConfig.
    // Going through APP_FILTER keeps the filter inside DI,
    // so it can inject the cookie options it must clear in authConfig.
    // NestJS rule: the "catch anything" filter must be declared FIRST so the specific filter still
    // handles its bound types (it is consulted first; the catch-all is the fallback).
    { provide: APP_FILTER, useClass: AppExceptionFilter },
    { provide: APP_FILTER, useClass: AuthExceptionFilter },
  ],
})
export class AppModule { }
