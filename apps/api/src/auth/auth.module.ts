import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { JwtStrategy } from 'src/_core/guards/strategies/jwt.strategy';
import { NotifierModule } from 'src/notifier/notifier.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StorageModule } from 'src/storage/storage.module';
import { UserModule } from 'src/user/user.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    // ─── JwtModule: make JwtService injectable — AuthService signs the access token with it
    JwtModule,
    // ─── PrismaModule: make PrismaService injectable in this module
    PrismaModule,
    // ─── StorageModule: make StorageService injectable — the sign-in response carries an avatarUrl
    StorageModule,
    // ─── NotifierModule: make NotifierService injectable in this module
    NotifierModule,
    // ─── UserModule: make UserService injectable — sign-up provisions the account through it
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
