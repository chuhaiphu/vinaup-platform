import { wageFilterSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class WageFilterRequest extends createZodDto(wageFilterSchema) {}
