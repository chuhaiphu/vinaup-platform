import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';
import { StorageModule } from 'src/storage/storage.module';

import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    // ─── PrismaModule: make PrismaService injectable in this module
    PrismaModule,
    // ─── StorageModule: make StorageService injectable in this module
    StorageModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
