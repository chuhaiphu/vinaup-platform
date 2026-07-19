import { updateTourImplementationAssignmentSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class UpdateTourImplementationAssignmentRequest extends createZodDto(updateTourImplementationAssignmentSchema) {}
