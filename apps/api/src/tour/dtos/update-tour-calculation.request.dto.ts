import { updateTourCalculationSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class UpdateTourCalculationRequest extends createZodDto(updateTourCalculationSchema) {}
