import { attendanceRecordFilterSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class AttendanceRecordFilterRequest extends createZodDto(attendanceRecordFilterSchema) {}
