import { projectFilterSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class ProjectFilterRequest extends createZodDto(projectFilterSchema) {}
