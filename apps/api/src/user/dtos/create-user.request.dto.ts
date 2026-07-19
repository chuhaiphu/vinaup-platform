import { createUserSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class CreateUserRequest extends createZodDto(createUserSchema) {}
