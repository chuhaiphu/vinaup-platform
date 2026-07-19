import { Module } from '@nestjs/common';

import { ValidatorsModule } from 'src/_core/validators/validators.module';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';

import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    // ─── PrismaModule: make PrismaService injectable in this module ───────────────
    // UserService injects PrismaService for DB access.//
    PrismaModule,
    AuthModule,
    // ─── ValidatorsModule: register the custom request-DTO validators ───
    // Registers the custom class-validator constraints this domain's DTOs use,
    // so class-validator can resolve them at validation time.
    ValidatorsModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
