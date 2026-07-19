import { createWageSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class CreateWageRequest extends createZodDto(createWageSchema) {}
