import { updateProjectSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class UpdateProjectRequest extends createZodDto(updateProjectSchema) {}
