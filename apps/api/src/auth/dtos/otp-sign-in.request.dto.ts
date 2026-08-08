import { otpSignInSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class OtpSignInRequest extends createZodDto(otpSignInSchema) {}
