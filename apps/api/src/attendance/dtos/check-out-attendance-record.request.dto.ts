import { checkOutAttendanceRecordSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class CheckOutAttendanceRecordRequest extends createZodDto(checkOutAttendanceRecordSchema) {}
