import { requestLinkEmailSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class RequestLinkEmailRequest extends createZodDto(requestLinkEmailSchema) {}
