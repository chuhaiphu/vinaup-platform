import { createCarAssignmentSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class CreateCarAssignmentRequest extends createZodDto(createCarAssignmentSchema) {}
