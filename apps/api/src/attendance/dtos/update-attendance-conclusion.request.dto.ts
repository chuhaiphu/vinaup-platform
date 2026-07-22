import { updateAttendanceConclusionSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class UpdateAttendanceConclusionRequest extends createZodDto(updateAttendanceConclusionSchema) {}
