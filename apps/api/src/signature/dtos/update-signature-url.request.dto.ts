import { updateSignatureUrlSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class UpdateSignatureUrlRequest extends createZodDto(updateSignatureUrlSchema) {}
