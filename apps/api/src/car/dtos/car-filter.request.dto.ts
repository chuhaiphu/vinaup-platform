import { carFilterSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class CarFilterRequest extends createZodDto(carFilterSchema) {}
