import { forgotPasswordOtpSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class ForgotPasswordOtpRequest extends createZodDto(forgotPasswordOtpSchema) {}
