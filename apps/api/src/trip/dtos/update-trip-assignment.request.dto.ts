import { updateTripAssignmentSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class UpdateTripAssignmentRequest extends createZodDto(updateTripAssignmentSchema) {}
