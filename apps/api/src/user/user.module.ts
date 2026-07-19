import { Module } from '@nestjs/common';

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
    ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
