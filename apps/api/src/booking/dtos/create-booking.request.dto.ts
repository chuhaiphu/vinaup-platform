import { createBookingSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class CreateBookingRequest extends createZodDto(createBookingSchema) {}
