import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { JwtStrategy } from 'src/_core/guards/strategies/jwt.strategy';
import { PrismaModule } from 'src/prisma/prisma.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    // ─── PassportModule + JwtModule: auth machinery used AND re-exported ─
    // JwtStrategy (a provider here) extends PassportStrategy; PassportModule wires it
    // into Passport so JwtAuthGuard can resolve the 'jwt' strategy at request time.
    // Both are re-exported (see exports) so feature modules importing AuthModule can
    // apply @UseGuards(JwtAuthGuard).
    PassportModule,
    JwtModule,
    // ─── PrismaModule: make PrismaService injectable in this module ───────────────
    // AuthService and JwtStrategy inject PrismaService for DB access.
    PrismaModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  // ─── exports: this module's public surface to OTHER modules ───────────
  // A module that imports AuthModule then gets PassportModule + JwtModule in its own scope.
  exports: [PassportModule, JwtModule],
})
export class AuthModule {}
