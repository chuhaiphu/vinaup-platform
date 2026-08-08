import { requestOtpSignInSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class RequestOtpSignInRequest extends createZodDto(requestOtpSignInSchema) {}
