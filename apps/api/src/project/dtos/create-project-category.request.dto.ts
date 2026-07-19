import { createProjectCategorySchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class CreateProjectCategoryRequest extends createZodDto(createProjectCategorySchema) {}
