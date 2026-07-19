import { createProjectSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class CreateProjectRequest extends createZodDto(createProjectSchema) {}
