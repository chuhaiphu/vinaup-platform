import { updateTourSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class UpdateTourRequest extends createZodDto(updateTourSchema) {}
