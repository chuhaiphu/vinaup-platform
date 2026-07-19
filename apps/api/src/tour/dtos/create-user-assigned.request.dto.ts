import { createUserAssignedSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class CreateUserAssignedRequest extends createZodDto(createUserAssignedSchema) {}
