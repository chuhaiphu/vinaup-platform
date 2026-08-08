import { resetPasswordOtpSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class ResetPasswordOtpRequest extends createZodDto(resetPasswordOtpSchema) {}
