import { bookingFilterSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class BookingFilterRequest extends createZodDto(bookingFilterSchema) {}
