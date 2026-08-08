import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';
import { StorageModule } from 'src/storage/storage.module';

import { AttendanceConclusionController } from './controllers/attendance-conclusion.controller';
import { AttendanceRecordController } from './controllers/attendance-record.controller';
import { AttendanceConclusionService } from './services/attendance-conclusion.service';
import { AttendanceRecordService } from './services/attendance-record.service';

@Module({
  imports: [
    // ─── PrismaModule: make PrismaService injectable in this module
    PrismaModule,
    // ─── StorageModule: make StorageService injectable in this module
    StorageModule,
  ],
  controllers: [AttendanceRecordController, AttendanceConclusionController],
  providers: [AttendanceRecordService, AttendanceConclusionService],
})
export class AttendanceModule {}
