import { updateUserSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class UpdateUserRequest extends createZodDto(updateUserSchema) {}
