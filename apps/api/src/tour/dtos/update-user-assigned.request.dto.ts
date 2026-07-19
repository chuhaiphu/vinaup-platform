import { updateUserAssignedSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class UpdateUserAssignedRequest extends createZodDto(updateUserAssignedSchema) {}
