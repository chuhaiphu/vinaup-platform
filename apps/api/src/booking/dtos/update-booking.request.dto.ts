import { updateBookingSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class UpdateBookingRequest extends createZodDto(updateBookingSchema) {}
