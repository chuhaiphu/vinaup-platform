import { createAttendanceConclusionSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class CreateAttendanceConclusionRequest extends createZodDto(createAttendanceConclusionSchema) {}
