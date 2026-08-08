import { refreshSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class RefreshRequest extends createZodDto(refreshSchema) {}
