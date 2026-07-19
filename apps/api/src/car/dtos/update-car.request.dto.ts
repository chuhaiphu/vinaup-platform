import { updateCarSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class UpdateCarRequest extends createZodDto(updateCarSchema) {}
