import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StorageModule } from 'src/storage/storage.module';

import { AttendanceConclusionController } from './controllers/attendance-conclusion.controller';
import { AttendanceRecordController } from './controllers/attendance-record.controller';
import { AttendanceConclusionService } from './services/attendance-conclusion.service';
import { AttendanceRecordService } from './services/attendance-record.service';

@Module({
  imports: [PrismaModule, StorageModule, AuthModule],
  controllers: [AttendanceRecordController, AttendanceConclusionController],
  providers: [AttendanceRecordService, AttendanceConclusionService],
})
export class AttendanceModule {}
