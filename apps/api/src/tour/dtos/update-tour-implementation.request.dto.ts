import { updateTourImplementationSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class UpdateTourImplementationRequest extends createZodDto(updateTourImplementationSchema) {}
