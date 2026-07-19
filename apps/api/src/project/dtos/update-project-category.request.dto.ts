import { updateProjectCategorySchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class UpdateProjectCategoryRequest extends createZodDto(updateProjectCategorySchema) {}
