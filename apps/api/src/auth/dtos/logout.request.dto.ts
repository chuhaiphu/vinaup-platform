import { logoutSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class LogoutRequest extends createZodDto(logoutSchema) {}
