import { updateTripSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class UpdateTripRequest extends createZodDto(updateTripSchema) {}
