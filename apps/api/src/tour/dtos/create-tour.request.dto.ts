import { createTourSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class CreateTourRequest extends createZodDto(createTourSchema) {}
