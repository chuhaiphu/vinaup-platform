import { updateAttendanceRecordSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class UpdateAttendanceRecordRequest extends createZodDto(updateAttendanceRecordSchema) {}
