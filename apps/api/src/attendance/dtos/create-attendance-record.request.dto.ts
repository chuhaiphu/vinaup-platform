import { createAttendanceRecordSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class CreateAttendanceRecordRequest extends createZodDto(createAttendanceRecordSchema) {}
