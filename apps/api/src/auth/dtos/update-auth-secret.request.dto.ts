import { updateAuthSecretSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class UpdateAuthSecretRequest extends createZodDto(updateAuthSecretSchema) {}
