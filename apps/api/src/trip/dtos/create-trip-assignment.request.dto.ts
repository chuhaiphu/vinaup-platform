import { createTripAssignmentSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class CreateTripAssignmentRequest extends createZodDto(createTripAssignmentSchema) {}
