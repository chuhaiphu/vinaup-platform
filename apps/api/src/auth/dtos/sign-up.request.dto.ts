import { signUpSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class SignUpRequest extends createZodDto(signUpSchema) {}
