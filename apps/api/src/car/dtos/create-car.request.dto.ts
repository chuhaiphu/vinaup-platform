import { createCarSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class CreateCarRequest extends createZodDto(createCarSchema) {}
