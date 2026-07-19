import { localSignInSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class LocalSignInRequest extends createZodDto(localSignInSchema) {}
