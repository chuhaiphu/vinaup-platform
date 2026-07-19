import { tripFilterSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class TripFilterRequest extends createZodDto(tripFilterSchema) {}
