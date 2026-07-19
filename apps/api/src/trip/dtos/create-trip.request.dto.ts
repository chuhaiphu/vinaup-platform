import { createTripSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class CreateTripRequest extends createZodDto(createTripSchema) {}
