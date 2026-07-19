import { updateWageSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class UpdateWageRequest extends createZodDto(updateWageSchema) {}
