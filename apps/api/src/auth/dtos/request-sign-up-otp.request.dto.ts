import { requestSignUpOtpSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class RequestSignUpOtpRequest extends createZodDto(requestSignUpOtpSchema) {}
