import { userFilterSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class UserFilterRequest extends createZodDto(userFilterSchema) {}
